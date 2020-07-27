import * as os from "os";
import * as path from "path";

import * as sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as yargs from "yargs";

import { BEAR_DB } from "./lib/constants";
import findDuplicates from "./lib/findDuplicates";

async function main() {
  sqlite3.verbose();
  const bear_db_path = path.join(os.homedir(), BEAR_DB.path);
  const db = await open({
    filename: bear_db_path,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY,
  });
  try {
    yargs
      .scriptName("bear-tracks")
      .usage("$0 <cmd> [args]")
      .command("duplicates", "Find duplicate note titles", async function (
        _argv: yargs.Arguments
      ) {
        const titles = await findDuplicates(db);
        console.log("Notes with duplicated titles:");
        console.log(titles);
      }).argv;
  } finally {
    await db.close();
  }
}

main().catch((err) => {
  console.error(err);
});
