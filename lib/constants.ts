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
  invalid: /[/\\*?$@!^&\|~:\.]/,
  ends_in_dash: /-$/,
};

export enum CreateNoteType {
  DAILY = "daily",
  WEEKLY = "weekly",
}

export const AGENT = {
  [CreateNoteType.DAILY]: {
    agentname: "edu.zahanm.bear-tracks.daily.plist",
    filename: "daily.plist",
  },
  [CreateNoteType.WEEKLY]: {
    agentname: "edu.zahanm.bear-tracks.weekly.plist",
    filename: "weekly.plist",
  },
};
