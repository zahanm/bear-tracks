import * as os from "os";
import * as path from "path";
import * as fs from "fs/promises";

import * as sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Command, program } from "commander";
import * as columnify from "columnify";
import * as YAML from "yaml";
import * as moment from "moment";

import { BEAR_DB, AgentType, CreateNoteType, CONF } from "./lib/constants";
import { findDuplicateNoteCounts } from "./lib/findDuplicates";
import { invalidFilenames, invalidLinks } from "./lib/invalids";
import {
  createDailyNote,
  createWeeklyNote,
  createMonthlyNote,
} from "./lib/createNote";
import { installAgent } from "./lib/installAgent";
import { deduplicateNotes } from "./lib/deduplicateNotes";
import missingTitles from "./lib/missingTitles";
import { transformToObsidian, transformToBear } from "./lib/transformSyntax";
import { sync } from "./lib/sync";
import { setupLogs } from "./lib/setupLogs";
import { Logger } from "./lib/Logger";
import { fixInvalidNoteTitles } from "./lib/fixTitles";
import { findOrphanedLinks } from "./lib/orphanedLinks";
import { notifyAndStopSync } from "./lib/notify";

/**
 * NOTE: Since this is a script, the @returns notations below are referring to
 * what is printed to stdout
 */
async function main() {
  program
    .name("bear-tracks")
    .option("-d, --debug", "output extra debugging to stderr", false)
    .option("--write", "allows writes to Bear.app's data stores", false)
    .option(
      "--cron",
      "redirects std{out,err} to a logfile for background execution",
      false
    );
  const conf = await readConf();
  sqlite3.verbose();
  const bearDbPath = path.join(os.homedir(), BEAR_DB.path);
  const db = await open({
    filename: bearDbPath,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY,
  });
  try {
    /**
     * @returns the duplicated note titles, and how many there are
     */
    program
      .command("duplicates")
      .description("Find notes with duplicate titles")
      .action(async function () {
        const titleCounts = await findDuplicateNoteCounts(program.opts(), db);
        console.log(columnify(titleCounts));
      });

    type TitleType = "filename" | "link";
    /**
     * @returns the invalid note titles
     */
    program
      .command("invalids <type>")
      .description(`Find notes with invalid titles (as "filename" or "link")`)
      .action(async function (type: TitleType) {
        let titles;
        switch (type) {
          case "filename":
            titles = await invalidFilenames(program.opts(), db);
            break;
          case "link":
            titles = await invalidLinks(program.opts(), db);
            break;
          default:
            // Need this because the string literal is coming from user input
            throw new Error(`Invalid type ${type}`);
        }
        console.log(titles.join("\n"));
      });

    /**
     * @returns notes missing titles
     */
    program
      .command("no-titles")
      .description("Find notes with missing titles (as an H1 block)")
      .action(async function () {
        const titles = await missingTitles(program.opts(), db);
        console.log(titles.join("\n"));
      });

    /**
     * Writes to Bear.app to re-title the notes with invalid filenames.
     */
    program
      .command("fix-titles")
      .description(
        "Re-title notes with invalid titles, that can't be filenames."
      )
      .action(async function () {
        await fixInvalidNoteTitles(program.opts(), db);
      });

    /**
     * @returns the created note title
     */
    program
      .command("create <note-type>")
      .description("Create a note of the type specified")
      .option(
        "--at <date>",
        "set the current time to use with note creation. Useful for testing. In YYYY-MM-DD format."
      )
      .action(async function (ntype: CreateNoteType, command: Command) {
        const at = moment(command.opts().at);
        let note;
        switch (ntype) {
          case "daily":
            note = await createDailyNote(program.opts(), at);
            break;
          case "weekly":
            note = await createWeeklyNote(program.opts(), at);
            break;
          case "monthly":
            note = await createMonthlyNote(program.opts(), at);
            break;
          default:
            throw new Error(`Invalid note-type: ${ntype}`);
        }
        const logger = new Logger(program.cron);
        logger.log(`Created: ${note.title}`);
        logger.close();
      });

    /**
     * Symlinks the launch-agent plist in place
     */
    program
      .command("install-agent <note-type>")
      .description("Set up the launch-agent for a periodic job")
      .action(async function (agentType: AgentType) {
        switch (agentType) {
          case "daily":
          case "weekly":
          case "monthly":
          case "sync":
            await installAgent(program.opts(), agentType);
            break;
          default:
            throw new Error(`Invalid agent-type: ${agentType}`);
        }
      });

    /**
     * Writes to Bear.app to de-duplicate the note titles
     */
    program
      .command("de-duplicate")
      .description("De-duplicate note titles by writing to Bear.app")
      .action(async function () {
        await deduplicateNotes(program.opts(), db);
      });

    type DestinationApp = "Bear.app" | "Obsidian.app";
    /**
     * Transforms to/from Bear.app <> Obsidian.app syntax
     * @returns transformed note Markdown text
     */
    program
      .command("transform <destination-app> <file>")
      .description("Transform syntax to/from Bear.app <> Obsidian.app")
      .action(async function (dest: DestinationApp, file: string) {
        const original = await fs.readFile(file, { encoding: "utf8" });
        let transformed;
        switch (dest) {
          case "Obsidian.app":
            transformed = await transformToObsidian(program.opts(), original);
            break;
          case "Bear.app":
            transformed = await transformToBear(program.opts(), original);
            break;
          default:
            // Need this because the string literal is coming from user input
            throw new Error(`Invalid type ${dest}`);
        }
        console.log(transformed);
      });

    /**
     * Sync Bear.app <> local folder
     * Imports any modified notes from the local folder.
     * Writes out all the notes with the Obsidian.app syntax transformations.
     */
    program
      .command("sync <destination-folder>")
      .description(
        "Sync Bear.app notes to an external folder. Import, then export."
      )
      .option(
        "--strict",
        "abort the export if there are notes with invalid titles",
        false
      )
      .action(async function (dest: string, command: Command) {
        try {
          const stat = await fs.stat(dest);
          if (!stat.isDirectory()) {
            throw new Error(`Must provide valid folder: ${dest}`);
          }
          await sync({ ...program.opts(), ...command.opts() }, db, dest);
        } catch (err) {
          if (program.cron && conf != null) {
            const { message } = err as Error;
            notifyAndStopSync(program.opts(), conf, message);
          } else {
            throw err;
          }
        }
      });

    /**
     * Sets up config for logrotate, and puts the log file in place.
     * It's assumed that this is installed with homebrew.
     */
    program
      .command("setup-logs")
      .description("Configures logrotate, and puts the logfile in place.")
      .action(async function () {
        await setupLogs(program.opts());
      });

    /**
     * Finds orphaned links in notes. ie, a [[Note link]] that doesn't lead
     * to a valid note.
     */
    program
      .command("orphaned-links <notes-dir>")
      .description("Find orphaned internal links")
      .action(async function (notesDir: string) {
        await findOrphanedLinks(program.opts(), notesDir);
      });

    await program.parseAsync();
  } finally {
    await db.close();
  }
}

async function readConf(): Promise<CONF | null> {
  const filename = process.env["TRACKS_CONF"];
  if (filename === undefined) {
    return null;
  }
  const contents = await fs.readFile(filename, { encoding: "utf8" });
  return YAML.parse(contents);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
