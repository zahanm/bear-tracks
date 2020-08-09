import * as path from "path";
import * as fs from "fs/promises";
import * as os from "os";

import { Database } from "sqlite";

import { BEAR_DB, SYNC } from "./constants";
import { getAllNotes } from "./getAllNotes";

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
    console.error("Starting sync now.");
    const notes = await getAllNotes(this.opts, this.db);
    console.error(`${notes.length} notes to write.`);
  }
}

async function dbIsModified(destFolder: string): Promise<boolean> {
  if (!(await fileExists(path.join(destFolder, SYNC.files.sync)))) {
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

async function fileExists(file: string) {
  const stat = await fs.stat(file);
  return stat.isFile();
}

async function createTempFolder() {
  return await fs.mkdtemp(path.join(os.tmpdir(), SYNC.locations.temp_prefix));
}
