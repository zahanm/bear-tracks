import { equal } from "assert";
import * as path from "path";
import * as os from "os";
import { open, Database } from "sqlite";
import * as sqlite3 from "sqlite3";

import { BEAR_DB } from "../lib/constants";
import {
  findDuplicateNotes,
  findDuplicateNoteCounts,
} from "../lib/findDuplicates";
import { before, describe, it, after } from "mocha";

describe("Duplicate counters", () => {
  let db: Database;

  before("open DB", async () => {
    const bear_db_path = path.join(os.homedir(), BEAR_DB.path);
    db = await open({
      filename: bear_db_path,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READONLY,
    });
  });

  it(`should have the same # of notes either way`, async () => {
    const [duplicates, counts] = await Promise.all([
      findDuplicateNotes({}, db),
      findDuplicateNoteCounts({}, db),
    ]);
    equal(
      counts.reduce((acc, val) => acc + val.count, 0),
      duplicates.length
    );
  });

  after("close DB", async () => {
    await db.close();
  });
});
