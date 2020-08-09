import * as path from "path";
import * as fs from "fs/promises";
import * as os from "os";

import { BEAR_DB, SYNC } from "./constants";
import { Database } from "sqlite";

export async function sync(db: Database, destFolder: string) {
  const syncer = new Syncer(destFolder);
  await syncer.run();
}

class Syncer {
  constructor(readonly destFolder: string) {}

  async run() {
    if (!(await this.dbIsModified())) {
      return;
    }
    // run sync
    console.error("Need to run a sync now");
  }

  private async dbIsModified(): Promise<boolean> {
    if (!(await fileExists(path.join(this.destFolder, SYNC.files.SYNC)))) {
      return true;
    }
    const dbModifiedTs = await getMTime(path.join(os.homedir(), BEAR_DB.path));
    const lastExportTs = await getMTime(
      path.join(this.destFolder, SYNC.files.EXPORT)
    );
    return dbModifiedTs > lastExportTs;
  }
}

async function getMTime(file: string) {
  const stat = await fs.stat(file);
  return stat.mtime;
}

async function fileExists(file: string) {
  const stat = await fs.stat(file);
  return stat.isFile();
}
