import { spawnSync } from "child_process";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { Database } from "sqlite";
import {
  bearApiCreateNote,
  DEFAULT_OPTIONS,
  bearXCallback,
  XCommand,
} from "./bearXCallback";
import { BEAR_DB, SYNC } from "./constants";
import { getAllNotes, Note } from "./getAllNotes";
import { transformToBear, transformToObsidian } from "./transformSyntax";

export async function sync(
  opts: Record<string, any>,
  db: Database,
  destFolder: string
) {
  if (!(await dbIsModified(destFolder))) {
    console.error("No sync needed.");
    return;
  }
  const syncer = new Syncer(opts, db, destFolder, await createTempFolder());
  await syncer.run();
}

class Syncer {
  constructor(
    readonly opts: Record<string, any>,
    readonly db: Database,
    readonly destFolder: string,
    readonly tempFolder: string
  ) {}

  async run() {
    console.error("Starting sync.");
    await this.importUpdatesFromDestination();
    console.error("Import complete, now starting export.");
    return; // TODO remove this once import is ready
    const notes = await getAllNotes(this.opts, this.db);
    console.error(`${notes.length} notes to export.`);
    await this.writeToTempFolder(notes);
    await this.rsyncTempToDestination();
    console.error("Sync complete.");
  }

  private async importUpdatesFromDestination() {
    if (!(await destFolderIsPopulated(this.destFolder))) {
      if (this.opts.debug) {
        console.error(
          `Destination ${this.destFolder} is not populated, skipping import.`
        );
      }
      return;
    }
    const syncFile = path.join(this.destFolder, SYNC.files.sync);
    const syncTs = await getMTime(syncFile);
    const exportTs = await getMTime(
      path.join(this.destFolder, SYNC.files.export)
    );
    for await (const entry of await fs.opendir(this.destFolder)) {
      const file = path.join(this.destFolder, entry.name);
      if (entry.isDirectory()) {
        if (this.opts.debug) {
          console.error(`Skip (nested folder): ${entry.name}`);
        }
        continue;
      }
      if (!SYNC.supported.has(path.extname(entry.name))) {
        if (this.opts.debug) {
          console.error(`Skip (unsupported file type): ${entry.name}`);
        }
        continue;
      }
      const fileTs = await getMTime(file);
      if (fileTs > syncTs) {
        console.error(`Import: ${entry.name}`);
        const text = await fs.readFile(file, { encoding: "utf8" });
        const uuid = findUUID(text);
        const title = findTitle(text, entry.name);
        const transformed = await transformToBear(this.opts, text);
        if (this.opts.debug) {
          process.stderr.write(transformed + "\n");
        }
        await this.updateNoteInBear(uuid, transformed, title, fileTs, exportTs);
      }
    }
    // TODO put this back in once I'm done working on sync
    // await updateMTime(syncFile, new Date());
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
      // TODO check for sync conflict
      await bearXCallback(this.opts, XCommand.EDIT, {
        id: uuid,
        mode: "replace_all",
        text,
        title,
        ...DEFAULT_OPTIONS,
      });
    } else {
      // create a new note
      await bearApiCreateNote(this.opts, {
        text,
        title,
        ...DEFAULT_OPTIONS,
      });
    }
  }

  private async writeToTempFolder(notes: Note[]) {
    if (this.opts.debug) {
      console.error(`Temp folder: ${this.tempFolder}`);
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
      process.stderr.write("x");
    }
    process.stderr.write("\n");
    // sync metadata files
    await fs.writeFile(
      path.join(this.tempFolder, SYNC.files.export),
      "Exported"
    );
    await fs.writeFile(path.join(this.tempFolder, SYNC.files.sync), "Synced");
    if (this.opts.debug) {
      console.error(`Written notes to temp folder`);
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
      console.error(`rsync "${args.join('" "')}"`);
    }
    const { error } = spawnSync("rsync", args);
    if (error) {
      throw error;
    }
  }
}

async function destFolderIsPopulated(destFolder: string) {
  const syncTs = path.join(destFolder, SYNC.files.sync);
  const exportTs = path.join(destFolder, SYNC.files.export);
  return (await fileExists(syncTs)) && (await fileExists(exportTs));
}

async function dbIsModified(destFolder: string): Promise<boolean> {
  if (!(await destFolderIsPopulated(destFolder))) {
    return true;
  }
  const dbModifiedTs = await getMTime(path.join(os.homedir(), BEAR_DB.path));
  const lastExportTs = await getMTime(path.join(destFolder, SYNC.files.export));
  return dbModifiedTs > lastExportTs;
}

async function getMTime(file: string) {
  const stat = await fs.stat(file);
  return stat.mtime;
}

async function updateMTime(file: string, time: Date) {
  await fs.utimes(file, time, time);
}

async function fileExists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
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
  const matches = text.match(SYNC.patterns.title);
  if (!matches) {
    throw new Error(`This note doesn't have a title: ${filename}`);
  }
  return matches[1];
}
