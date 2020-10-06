import { spawnSync } from "child_process";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { promisify } from "util";

import { Database } from "sqlite";
import * as moment from "moment";
import { ncp as ncpCallback } from "ncp";

import {
  bearApiCreateNote,
  DEFAULT_OPTIONS,
  bearXCallback,
  XCommand,
} from "./bearXCallback";
import { BEAR_DB, SYNC } from "./constants";
import { getAllNotes, Note, getNote } from "./getAllNotes";
import { transformToBear, transformToObsidian } from "./transformSyntax";
import { sleep, fileExists } from "./utils";
import { Logger } from "./Logger";
import missingTitles from "./missingTitles";
import { invalidFilenames } from "./invalids";
import { findDuplicateNotes } from "./findDuplicates";

const ncp = promisify(ncpCallback);

export async function sync(
  opts: Record<string, any>,
  db: Database,
  destFolder: string
) {
  const syncer = new Syncer(opts, db, destFolder, await createTempFolder());
  await syncer.run();
}

class Syncer {
  private logger: Logger;
  private allNotes?: Note[];

  constructor(
    readonly opts: Record<string, any>,
    readonly db: Database,
    readonly destFolder: string,
    readonly tempFolder: string
  ) {
    this.logger = new Logger(opts.cron);
  }

  async run() {
    try {
      this.printOnTerminal("Starting sync.");
      if (this.opts.strict) {
        this.printOnTerminal("Checking for invalid titles.");
        await this.checkForInvalidTitles();
      }
      this.printOnTerminal("Starting import.");
      await this.importUpdatesFromDestination();
      this.printOnTerminal("Import complete, now starting export.");
      if (this.opts.strict) {
        this.printOnTerminal("Checking for invalid titles.");
        await this.checkForInvalidTitles();
      }
      await this.exportToDestination();
      this.printOnTerminal("Sync complete.");
    } finally {
      this.logger.close();
    }
  }

  private async getNotesFromDB(): Promise<Note[]> {
    if (!this.allNotes) {
      this.allNotes = await getAllNotes(this.opts, this.db);
    }
    return this.allNotes;
  }

  private async checkForInvalidTitles() {
    const notes = await this.getNotesFromDB();
    const [missing, invalids, duplicates] = await Promise.all([
      missingTitles(this.opts, this.db, notes),
      invalidFilenames(this.opts, this.db, notes),
      findDuplicateNotes(this.opts, this.db, notes),
    ]);
    if (missing.length > 0 || invalids.length > 0 || duplicates.length > 0) {
      this.writeToLog(
        `There are ${missing.length} missing, ${duplicates.length} duplicate, and ${invalids.length} invalid note titles.`
      );
      throw new Error("Invalid note titles in strict mode.");
    }
    if (this.opts.debug) {
      this.printOnTerminal("No invalid note titles");
    }
  }

  private async importUpdatesFromDestination() {
    if (!(await destFolderIsPopulated(this.destFolder))) {
      this.writeToLog(
        `Destination ${this.destFolder} is not populated, skipping import.`
      );
      // Still need to update import mtime
      await fs.writeFile(
        path.join(this.tempFolder, SYNC.files.import),
        "Import"
      );
      return;
    }
    const importFile = path.join(this.destFolder, SYNC.files.import);
    const importTs = await getMTime(importFile);
    const exportTs = await getMTime(
      path.join(this.destFolder, SYNC.files.export)
    );
    let numImported = 0;
    for await (const entry of await fs.opendir(this.destFolder)) {
      const file = path.join(this.destFolder, entry.name);
      if (entry.isDirectory()) {
        if (this.opts.debug) {
          this.printOnTerminal(`Skip (nested folder): ${entry.name}`);
        }
        continue;
      }
      if (!SYNC.supported.has(path.extname(entry.name))) {
        if (this.opts.debug) {
          this.printOnTerminal(`Skip (unsupported file type): ${entry.name}`);
        }
        continue;
      }
      const fileTs = await getMTime(file);
      if (fileTs > importTs) {
        const text = await fs.readFile(file, { encoding: "utf8" });
        const uuid = findUUID(text);
        const title = findTitle(text, entry.name);
        const transformed = await transformToBear(this.opts, text);
        await this.updateNoteInBear(uuid, transformed, title, fileTs, exportTs);
        numImported++;
      }
    }
    // Sync metadata file for the "mtime"
    await fs.writeFile(path.join(this.tempFolder, SYNC.files.import), "Import");
    this.writeToLog(`${numImported} notes imported.`);
    if (numImported > 0) {
      const waitSec = 3;
      this.printOnTerminal(
        `Waiting ${waitSec} sec for Bear.app to process the imports...`
      );
      await sleep(waitSec * 1000);
    }
  }

  private async updateNoteInBear(
    uuid: string | null,
    text: string,
    title: string,
    mtime: Date,
    lastExportTs: Date
  ) {
    if (uuid != null) {
      // update existing note
      const note = await getNote(this.opts, this.db, uuid);
      if (conflicts(note, lastExportTs)) {
        this.writeToLog(`*Conflict*: ${title}`);
        // create a new note with a "Conflict!" notice appended
        const textWithConflict = addConflictNotice(text, uuid, mtime);
        if (this.opts.debug) {
          process.stderr.write(textWithConflict + "\n");
        }
        await bearApiCreateNote(this.opts, {
          text: textWithConflict,
          ...DEFAULT_OPTIONS,
        });
      } else {
        this.writeToLog(`Update: ${title}`);
        if (this.opts.debug) {
          process.stderr.write(text + "\n");
        }
        await bearXCallback(this.opts, XCommand.EDIT, {
          id: uuid,
          mode: "replace_all",
          text,
          ...DEFAULT_OPTIONS,
        });
      }
    } else {
      // create a new note
      this.writeToLog(`New: ${title}`);
      if (this.opts.debug) {
        process.stderr.write(text + "\n");
      }
      await bearApiCreateNote(this.opts, {
        text,
        ...DEFAULT_OPTIONS,
      });
    }
  }

  private async exportToDestination() {
    if (await exportIsNewerThanDb(this.destFolder)) {
      this.writeToLog(
        "No export needed, Bear.app notes haven't changed since last export."
      );
      return;
    }
    const notes = await this.getNotesFromDB();
    this.printOnTerminal(`${notes.length} notes to export.`);
    await this.writeToTempFolder(notes);
    await this.preserveExternalData();
    await this.rsyncTempToDestination();
  }

  private async writeToTempFolder(notes: Note[]) {
    if (this.opts.debug) {
      this.printOnTerminal(`Temp folder: ${this.tempFolder}`);
    }
    // Notes
    for (const note of notes) {
      const transformedText = await transformToObsidian(
        this.opts,
        note.text,
        note.uuid
      );
      const destFile = path.join(this.tempFolder, `${note.filename}.md`);
      await fs.writeFile(destFile, transformedText);
      await fs.utimes(destFile, note.modification_date, note.modification_date);
    }
    // sync metadata file, only the "mtime" is valuable
    await fs.writeFile(path.join(this.tempFolder, SYNC.files.export), "Export");
    if (this.opts.debug) {
      this.printOnTerminal(`Written notes to temp folder`);
    }
    this.writeToLog(`${notes.length} notes exported.`);
  }

  /**
   * Some folders, like the Obsidian metadata, are written in destFolder
   * Unfortunately, then get cleared on each export, because we're using
   * `rsync --delete`.
   *
   * This copies them out to tempFolder.
   */
  private async preserveExternalData() {
    for (const entry of SYNC.preserved) {
      const from = path.join(this.destFolder, entry);
      const to = path.join(this.tempFolder, entry);
      if (await fileExists(from)) {
        if (this.opts.debug) {
          this.printOnTerminal(`cp -R ${from} ${to}`);
        }
        await ncp(from, to);
      }
    }
  }

  /**
   * Moves markdown files to new folder using rsync:
   * This is a very important step!
   * By first exporting all Bear notes to an emptied temp folder,
   * rsync will only update destination if modified or size have changed.
   * So only changed notes will be synced by Dropbox or OneDrive destinations.
   * Rsync will also delete notes on destination if deleted in Bear.
   * So doing it this way saves a lot of otherwise very complex programing.
   * Thank you very much, Rsync! ;)
   *
   * And thank you, https://github.com/markgrovs/Bear-Markdown-Export for this technique!
   */
  private async rsyncTempToDestination() {
    const args = [
      "--recursive",
      "--times",
      "--extended-attributes",
      "--delete",
      this.tempFolder + path.sep,
      this.destFolder,
    ];
    if (this.opts.debug) {
      this.printOnTerminal(`rsync "${args.join('" "')}"`);
    }
    const { error } = spawnSync("rsync", args);
    if (error) {
      throw error;
    }
  }

  /**
   * Use this for information for someone to see what the script is doing now.
   */
  private printOnTerminal(line: string) {
    if (!this.opts.cron) {
      console.error(line);
    }
  }

  /**
   * Use this for information that should be stored in perpetuity in the log file.
   */
  private writeToLog(line: string) {
    this.logger.log(line);
  }
}

async function destFolderIsPopulated(destFolder: string) {
  const importTs = path.join(destFolder, SYNC.files.import);
  const exportTs = path.join(destFolder, SYNC.files.export);
  return (await fileExists(importTs)) && (await fileExists(exportTs));
}

async function exportIsNewerThanDb(destFolder: string): Promise<boolean> {
  if (!(await destFolderIsPopulated(destFolder))) {
    return false;
  }
  const dbModifiedTs = await getMTime(path.join(os.homedir(), BEAR_DB.path));
  const lastExportTs = await getMTime(path.join(destFolder, SYNC.files.export));
  return lastExportTs > dbModifiedTs;
}

async function getMTime(file: string) {
  const stat = await fs.stat(file);
  return stat.mtime;
}

function conflicts(note: Note, lastExportTs: Date) {
  return note.modification_date > lastExportTs;
}

async function createTempFolder() {
  return await fs.mkdtemp(path.join(os.tmpdir(), SYNC.locations.temp_prefix));
}

function findUUID(text: string): string | null {
  const matches = text.match(SYNC.patterns.uuid);
  if (!matches) {
    return null;
  }
  return matches[1];
}

function findTitle(text: string, filename: string): string {
  const lines = text.split("\n", 1);
  if (lines.length === 0) {
    throw new Error(`Empty note: ${filename}`);
  }
  const matches = lines[0].match(SYNC.patterns.title);
  if (!matches) {
    throw new Error(`This note doesn't have a title: ${filename}`);
  }
  return matches[2];
}

function addConflictNotice(text: string, uuid: string, mtime: Date): string {
  const noteLink = `bear://x-callback-url/open-note?id=${uuid}`;
  const when = moment(mtime);
  const lines = text.split("\n");
  const newTitle = lines[0].replace(SYNC.patterns.title, "$1=Conflict!= $2");
  lines.splice(0, 1, newTitle); // replace the title
  const textWithNewTitle = lines.join("\n");
  const notice = `

# Sync Conflict!
* ::Externally updated ${when.fromNow()} at ${when.format("llll")}::
* [Original Bear note](${noteLink})
`;
  return textWithNewTitle + notice;
}
