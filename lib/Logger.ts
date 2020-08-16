import { WriteStream, createWriteStream } from "fs";
import * as path from "path";

import { LOGS } from "./constants";
import * as moment from "moment";

export class Logger {
  private logfile: WriteStream | null = null;

  constructor(isBackgroundJob: boolean) {
    if (isBackgroundJob) {
      this.logfile = createWriteStream(path.join(LOGS.folder, LOGS.file), {
        flags: "a",
      });
    }
  }

  log(line: string) {
    if (this.logfile != null) {
      this.logfile.write(`${moment().format()}: ${line}\n`);
    } else {
      console.error(`${moment().format()}: ${line}`);
    }
  }

  close() {
    if (this.logfile != null) {
      this.logfile.close();
    }
  }
}
