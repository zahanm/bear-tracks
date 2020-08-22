import { SYNC } from "./constants";

const PATTERNS = {
  bear: {
    nested_tags: /\#\b([\w \-]*\/)+/gm,
    separator: /^~~\-~~$/gm,
    todo: {
      unchecked: /(^[ \t]*)\-(?=\s+\S)/gm,
      checked: /(^[ \t]*)\+(?=\s+\S)/gm,
    },
    list: {
      unordered: /(^[ \t]*)\*(?=\s+\S)/gm,
    },
    styles: {
      highlight: /(^|\s)\:\:(\S(.*?)\S)?\:\:/gm,
      bold: /(^|\s)\*([^\*\s](.*?)[^\*\s]?)\*/gm,
      italics: /(^|\s)\/(\S(.*?)\S?)\//gm,
      strike: /(^|\s)\-(\S(.*?)\S?)\-/gm,
    },
  },
  obsidian: {
    nested_tags: /\#\b([\w \-]*\_)+/gm,
    separator: /^\*\*\*$/gm,
    todo: {
      unchecked: /(^[ \t]*)\- \[ \](?=\s+\S)/gm,
      checked: /(^[ \t]*)\- \[x\](?=\s+\S)/gm,
    },
    list: {
      unordered: /(^[ \t]*)\-(?=\s+\S)(?! \[[ x]\])/gm,
    },
    styles: {
      highlight: /(^|\s)\=\=(\S(.*?)\S)?\=\=/gm,
      bold: /(^|\s)\*\*(\S(.*?)\S?)\*\*/gm,
      italics: /(^|\s)\*([^\*\s](.*?)[^\*\s]?)\*/gm,
      strike: /(^|\s)~~(\S(.*?)\S?)~~/gm,
    },
  },
};

export async function transformToObsidian(
  opts: Record<string, any>,
  content: string,
  uuid?: string
): Promise<string> {
  const text = content
    .replace(PATTERNS.bear.styles.highlight, "$1==$2==")
    .replace(PATTERNS.bear.styles.bold, "$1**$2**")
    .replace(PATTERNS.bear.styles.italics, "$1*$2*")
    .replace(PATTERNS.bear.styles.strike, "$1~~$2~~")
    .replace(PATTERNS.bear.nested_tags, (match: string) => {
      return match.replace(/\//g, "_");
    })
    .replace(PATTERNS.bear.todo.unchecked, "$1- [ ]")
    .replace(PATTERNS.bear.todo.checked, "$1- [x]")
    .replace(PATTERNS.bear.list.unordered, "$1-")
    .replace(PATTERNS.bear.separator, "***");
  if (uuid) {
    return appendUUID(text, uuid);
  } else {
    return text;
  }
}

export async function transformToBear(
  opts: Record<string, any>,
  content: string
): Promise<string> {
  return content
    .replace(PATTERNS.obsidian.styles.highlight, `$1::$2::`)
    .replace(PATTERNS.obsidian.styles.italics, "$1/$2/") // must run before styles.bold
    .replace(PATTERNS.obsidian.styles.bold, "$1*$2*")
    .replace(PATTERNS.obsidian.styles.strike, "$1-$2-")
    .replace(PATTERNS.obsidian.separator, "~~-~~") // must run after strike
    .replace(PATTERNS.obsidian.nested_tags, (match: string) => {
      return match.replace(/\_/g, "/");
    })
    .replace(PATTERNS.obsidian.list.unordered, "$1*") // must run before todo.unchecked
    .replace(PATTERNS.obsidian.todo.unchecked, "$1-")
    .replace(PATTERNS.obsidian.todo.checked, "$1+")
    .replace(SYNC.patterns.uuid, "");
}

function appendUUID(text: string, uuid: string): string {
  return text + `\n<!-- {BearID:${uuid}} -->\n`;
}
