import * as fs from "fs/promises";
import * as path from "path";

import { LOGS } from "./constants";
import { fileExists } from "./utils";

export async function setupLogs(opts: Record<string, any>) {
  if (!(await fileExists(LOGS.folder))) {
    console.error(`mkdir ${LOGS.folder}`);
    await fs.mkdir(LOGS.folder);
  }
  const logfile = path.join(LOGS.folder, LOGS.file);
  console.error(`touch ${logfile}`);
  await fs.appendFile(logfile, "");
  const conf_source = path.join(__dirname, "../config", LOGS.logrotate.file);
  if (!(await fileExists(LOGS.logrotate.conf))) {
    console.error(`ln -s ${conf_source} ${LOGS.logrotate.conf}`);
    await fs.symlink(conf_source, LOGS.logrotate.conf);
  } else {
    console.error(`${LOGS.logrotate.conf} already exists.`);
  }
}
