import * as os from "os";
import * as path from "path";
import * as fs from "fs/promises";

import * as sqlite3 from "sqlite3";
import { open } from "sqlite";
import { program } from "commander";
import * as columnify from "columnify";

import { BEAR_DB, CreateNoteType } from "./lib/constants";
import { findDuplicateNoteCounts } from "./lib/findDuplicates";
import { invalidFilenames, invalidLinks } from "./lib/invalids";
import { createDailyNote, createWeeklyNote } from "./lib/createNote";
import { installAgent } from "./lib/installAgent";
import { deduplicateNotes } from "./lib/deduplicateNotes";
import missingTitles from "./lib/missingTitles";
import { transformToObsidian, transformToBear } from "./lib/transformSyntax";

/**
 * NOTE: Since this is a script, the @returns notations below are referring to
 * what is printed to stdout
 */
async function main() {
  program
    .name("bear-tracks")
    .option("-d, --debug", "output extra debugging to stderr", false)
    .option("--write", "allows writes to Bear.app's data stores", false);
  sqlite3.verbose();
  const bear_db_path = path.join(os.homedir(), BEAR_DB.path);
  const db = await open({
    filename: bear_db_path,
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
     * @returns the created note title
     */
    program
      .command("create <note-type>")
      .description("Create a note of the type specified")
      .action(async function (ntype: CreateNoteType) {
        let note;
        switch (ntype) {
          case "daily":
            note = await createDailyNote(program.opts());
            break;
          case "weekly":
            note = await createWeeklyNote(program.opts());
            break;
          default:
            throw new Error(`Invalid note-type: ${ntype}`);
        }
        console.log(note.title);
      });

    /**
     * Symlinks the launch-agent plist in place
     */
    program
      .command("install-agent <note-type>")
      .description("Set up the launch-agent for a particular note type")
      .action(async function (ntype: CreateNoteType) {
        if (!(ntype in ["daily", "weekly"])) {
          throw new Error(`Invalid note-type: ${ntype}`);
        }
        await installAgent(program.opts(), ntype);
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
      .command("transform <dest-app> <file>")
      .description("Transform syntax to/from Bear.app <> Obsidian.app")
      .action(async function (dest: DestinationApp, file: string) {
        const original = await fs.readFile(file, { encoding: "utf8" });
        let transformed;
        switch (dest) {
          case "Bear.app":
            transformed = await transformToObsidian(program.opts(), original);
            break;
          case "Obsidian.app":
            transformed = await transformToBear(program.opts(), original);
            break;
          default:
            // Need this because the string literal is coming from user input
            throw new Error(`Invalid type ${dest}`);
        }
        console.log(transformed);
      });

    await program.parseAsync();
  } finally {
    await db.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
