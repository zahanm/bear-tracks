import * as fs from "fs/promises";
import * as path from "path";
import { env } from "process";

import { LOGS } from "./constants";
import { fileExists } from "./utils";

export async function setupLogs(opts: Record<string, any>) {
  const logsDir = path.join(env["HOME"]!, "homebrew", LOGS.folder);
  if (!(await fileExists(logsDir))) {
    console.error(`mkdir ${logsDir}`);
    await guardedWrite(opts, async () => {
      await fs.mkdir(logsDir);
    });
  }
  const logfile = path.join(logsDir, LOGS.file);
  console.error(`touch ${logfile}`);
  await guardedWrite(opts, async () => {
    await fs.appendFile(logfile, "");
  });
  const conf_source = path.join(__dirname, "../config", LOGS.logrotate.file);
  const lrConf = path.join(env["HOME"]!, "homebrew", LOGS.logrotate.conf);
  if (!(await fileExists(lrConf))) {
    console.error(`ln -s ${conf_source} ${lrConf}`);
    await guardedWrite(opts, async () => {
      await fs.symlink(conf_source, lrConf);
    });
  } else {
    console.error(`${lrConf} already exists.`);
  }
}

async function guardedWrite(
  opts: Record<string, any>,
  doWrite: () => Promise<void>
) {
  if (!opts.write) {
    console.error(
      `>>> Need to specify --write in order to modify filesystem <<<`
    );
  } else {
    await doWrite();
  }
}
