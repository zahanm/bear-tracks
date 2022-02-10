export const BEAR_DB = {
  path:
    "Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data/database.sqlite",
  notes: {
    name: "ZSFNOTE",
    cols: {
      trashed: "ZTRASHED",
      archived: "ZARCHIVED",
      title: "ZTITLE",
      creation_date: "ZCREATIONDATE",
      modification_date: "ZMODIFICATIONDATE",
      text: "ZTEXT",
      uuid: "ZUNIQUEIDENTIFIER",
    },
  },
};

export const FILENAME_PATTERNS = {
  invalid: /[\|\/]/,
};

export const LINK_PATTERNS = {
  invalid: /[\|]/,
};

export type CreateNoteType = "daily" | "weekly" | "monthly";

export type AgentType = CreateNoteType | "sync";

export const AGENT: Record<AgentType, Record<string, string>> = {
  daily: {
    agentname: "edu.zahanm.bear-tracks.daily.plist",
    filename: "daily.plist",
  },
  weekly: {
    agentname: "edu.zahanm.bear-tracks.weekly.plist",
    filename: "weekly.plist",
  },
  monthly: {
    agentname: "edu.zahanm.bear-tracks.monthly.plist",
    filename: "monthly.plist",
  },
  sync: {
    agentname: "edu.zahanm.bear-tracks.sync.plist",
    filename: "sync.plist",
  },
};

export const SYNC = {
  files: {
    import: ".sync-time.log",
    export: ".export-time.log",
  },
  locations: {
    temp_prefix: "edu.zahanm.bear-tracks.sync-",
  },
  supported: new Set([".md"]),
  preserved: [".obsidian", "obsidian.css"],
  patterns: {
    uuid: /\n<!-- {BearID:([\w\-]+)} -->\n/,
    title: /^(#\s+)(.+)/,
  },
};

export const LOGS = {
  folder: "var/log/",
  file: "edu.zahanm.bear-tracks.log",
  logrotate: {
    conf: "etc/logrotate.d/edu.zahanm.bear-tracks.conf",
    file: "logrotate.conf",
  },
};

export type CONF = {
  things: {
    "auth-token": string;
    "list-id": string;
  };
};
