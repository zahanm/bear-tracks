import { promises as fs } from "fs";
import * as path from "path";
import * as os from "os";
import { AGENT, AgentType } from "./constants";

export async function installAgent(
  opts: Record<string, any>,
  ntype: AgentType
) {
  const plist_destination = path.join(
    os.homedir(),
    "Library/LaunchAgents",
    AGENT[ntype].agentname
  );
  const plist_source = path.join(__dirname, "../config", AGENT[ntype].filename);
  console.error(`ln -s ${plist_source} ${plist_destination}`);
  if (!opts.write) {
    console.error(
      `>>> Need to specify --write in order to modify filesystem <<<`
    );
  } else {
    await fs.symlink(plist_source, plist_destination);
  }
}
