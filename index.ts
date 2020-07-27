import * as os from "os";
import * as path from "path";

import { Database, verbose, OPEN_READONLY } from "sqlite3";
import { open } from "sqlite";

const BEAR_DB = {
  path:
    "Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data/database.sqlite",
  notes: {
    name: "ZSFNOTE",
    columns: {
      trashed: "ZTRASHED",
      archived: "ZARCHIVED",
    },
  },
};

(async () => {
  verbose();
  const bear_db_path = path.join(os.homedir(), BEAR_DB.path);
  const db = await open({
    filename: bear_db_path,
    driver: Database,
    mode: OPEN_READONLY,
  });
  try {
    const row = await db.get(
      `select count(*) from ${BEAR_DB.notes.name}
        where ${BEAR_DB.notes.columns.trashed} like '0'
        and ${BEAR_DB.notes.columns.archived} like '0'`
    );
    console.log(row);
  } finally {
    await db.close();
  }
})();
