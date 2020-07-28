import * as os from "os";
import * as path from "path";

import * as sqlite3 from "sqlite3";
import { open } from "sqlite";
import { program } from "commander";
import * as columnify from "columnify";

import { BEAR_DB } from "./lib/constants";
import findDuplicates from "./lib/findDuplicates";
import invalidFilenames from "./lib/invalidFilenames";
import { createNote, CreateType } from "./lib/createNote";

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
    program
      .command("duplicates")
      .description("Find notes with duplicate titles")
      .action(async function () {
        const titleCounts = await findDuplicates(db);
        console.log(columnify(titleCounts));
      });

    program
      .command("invalids")
      .description("Find notes with invalid titles (as filenames)")
      .action(async function () {
        const titles = await invalidFilenames(db);
        console.log(titles.join("\n"));
      });

    /**
     * We'll print the created note UUID to stdout
     */
    program
      .command("create <note-type>")
      .description("Create a note of the type specified")
      .action(async function (ntype: CreateType) {
        if (Object.values(CreateType).indexOf(ntype) < 0) {
          throw new Error(`Invalid note-type: ${ntype}`);
        }
        const note = await createNote(ntype);
        console.error(`Made "${note.title}"`);
        console.log(note.uuid);
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
