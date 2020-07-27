import * as os from "os";
import * as path from "path";

import * as sqlite3 from "sqlite3";
import { open } from "sqlite";

import { BEAR_DB } from "./lib/constants";
import findDuplicates from "./lib/findDuplicates";

(async () => {
  sqlite3.verbose();
  const bear_db_path = path.join(os.homedir(), BEAR_DB.path);
  const db = await open({
    filename: bear_db_path,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY,
  });
  try {
    const titles = await findDuplicates(db);
    console.log("Notes with duplicated titles:");
    console.log(titles);
  } finally {
    await db.close();
  }
})();
