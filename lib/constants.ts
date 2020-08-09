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

/**
 * keep in sync with https://github.com/zahanm/Bear-Markdown-Export
 */
export const FILENAME_PATTERNS = {
  invalid: /[\/\\*?$@!^&\|~:\.]/g,
  ends_in_dash: /-$/,
};

export const LINK_PATTERNS = {
  invalid: /[\|]/,
};

export type CreateNoteType = "daily" | "weekly";

export const AGENT: Record<CreateNoteType, Record<string, string>> = {
  daily: {
    agentname: "edu.zahanm.bear-tracks.daily.plist",
    filename: "daily.plist",
  },
  weekly: {
    agentname: "edu.zahanm.bear-tracks.weekly.plist",
    filename: "weekly.plist",
  },
};

export const SYNC = {
  files: {
    sync: ".sync-time.log",
    export: ".export-time.log",
  },
  locations: {
    temp_prefix: "edu.zahanm.bear-tracks.sync-",
  },
};
