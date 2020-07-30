import * as os from "os";
import * as path from "path";

import * as sqlite3 from "sqlite3";
import { open } from "sqlite";
import { program } from "commander";
import * as columnify from "columnify";

import { BEAR_DB, CreateNoteType } from "./lib/constants";
import { findDuplicateNoteCounts } from "./lib/findDuplicates";
import invalidFilenames from "./lib/invalidFilenames";
import { createNote } from "./lib/createNote";
import { installAgent } from "./lib/installAgent";

/**
 * NOTE: Since this is a script, the @returns notations below are referring to
 * what is printed to stdout
 */
async function main() {
  program.name("bear-tracks");
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
        const titleCounts = await findDuplicateNoteCounts(db);
        console.log(columnify(titleCounts));
      });

    /**
     * @returns the invalid note titles
     */
    program
      .command("invalids")
      .description("Find notes with invalid titles (as filenames)")
      .action(async function () {
        const titles = await invalidFilenames(db);
        console.log(titles.join("\n"));
      });

    /**
     * @returns the created note title
     */
    program
      .command("create <note-type>")
      .description("Create a note of the type specified")
      .action(async function (ntype: CreateNoteType) {
        validateCreateType(ntype);
        const note = await createNote(ntype);
        console.log(note.title);
      });

    program
      .command("install-agent <note-type>")
      .description("Set up the launch-agent for a particular note type")
      .action(async function (ntype: CreateNoteType) {
        validateCreateType(ntype);
        await installAgent(ntype);
      });

    await program.parseAsync();
  } finally {
    await db.close();
  }
}

function validateCreateType(ntype: CreateNoteType) {
  if (Object.values(CreateNoteType).indexOf(ntype) < 0) {
    throw new Error(`Invalid note-type: ${ntype}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
