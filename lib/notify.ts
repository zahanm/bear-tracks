import { spawnSync } from "child_process";
import path = require("path");
import os = require("os");
import { stringify } from "querystring";
import { AGENT, CONF } from "./constants";

export async function notifyAndStopSync(
  opts: Record<string, any>,
  conf: CONF,
  title: string
) {
  const todo = `bear-tracks sync blocked! ${title}`;
  console.error(`Adding to Things: ${todo}`);
  runURLCommand(opts, makeTodoURL(conf, todo));
  console.error("Un-loading (stopping) sync job");
  stopSyncJob(opts);
}

function makeTodoURL(conf: CONF, title: string): string {
  const query = stringify({
    title,
    when: "today",
    "list-id": conf.things["list-id"],
    notes,
  });
  return `things:///add?${query}`;
}

const notes = `Look at the logs
less +G /usr/local/var/log/edu.zahanm.bear-tracks.log

Run it locally
bear-tracks sync ...

Re-enable the job
launchctl load ~/Library/LaunchAgents/edu.zahanm.bear-tracks.sync.plist
`;

function runURLCommand(opts: Record<string, any>, command: string) {
  if (opts.debug) {
    console.error(`open -g "${command}"`);
  }
  const { error } = spawnSync("open", ["-g", command]);
  if (error) {
    throw error;
  }
}

function stopSyncJob(opts: Record<string, any>) {
  const agent = path.join(
    os.homedir(),
    "Library/LaunchAgents",
    AGENT.sync.agentname
  );
  if (opts.debug) {
    console.error(`launchctl unload "${agent}"`);
  }
  const { error } = spawnSync("launchctl", ["unload", agent]);
  if (error) {
    throw error;
  }
}
