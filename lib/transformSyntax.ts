import { SYNC } from "./constants";

const PATTERNS = {
  bear: {
    nested_tags: /\#\b([\w \-]*\/)+/g,
    separator: /^~~\-~~$/,
    todo: {
      unchecked: /(^[ \t]*)\-(?=\s+\S)/g,
      checked: /(^[ \t]*)\+(?=\s+\S)/g,
    },
    list: {
      unordered: /(^[ \t]*)\*(?=\s+\S)/g,
    },
    styles: {
      highlight: /(^|\s)\:\:(\S(.*?)\S)?\:\:/g,
      bold: /(^|\s)\*([^\*\s](.*?)[^\*\s]?)\*/g,
      italics: /(^|\s)\/(\S(.*?)\S?)\//g,
      strike: /(^|\s)\-(\S(.*?)\S?)\-/g,
    },
  },
  obsidian: {
    nested_tags: /\#\b([\w \-]*\_)+/g,
    separator: /^\*\*\*$/,
    todo: {
      unchecked: /(^[ \t]*)\- \[ \](?=\s+\S)/g,
      checked: /(^[ \t]*)\- \[x\](?=\s+\S)/g,
    },
    list: {
      unordered: /(^[ \t]*)\-(?=\s+\S)(?! \[[ x]\])/g,
    },
    styles: {
      highlight: /(^|\s)\=\=(\S(.*?)\S)?\=\=/g,
      bold: /(^|\s)\*\*(\S(.*?)\S?)\*\*/g,
      italics: /(^|\s)\*([^\*\s](.*?)[^\*\s]?)\*/g,
      strike: /(^|\s)~~(\S(.*?)\S?)~~/g,
    },
  },
  common: {
    codeblock: /\`\`\`/,
  },
};

export async function transformToObsidian(
  opts: Record<string, any>,
  content: string,
  uuid?: string
): Promise<string> {
  let isInCodeBlock = false;
  const text = content
    .split("\n")
    .map((line) => {
      if (line.match(PATTERNS.common.codeblock)) {
        isInCodeBlock = !isInCodeBlock;
      }
      if (isInCodeBlock) {
        return line; // run no transforms in code block
      }
      return line
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
    })
    .join("\n");
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
  let isInCodeBlock = false;
  const text = content
    .split("\n")
    .map((line) => {
      if (line.match(PATTERNS.common.codeblock)) {
        isInCodeBlock = !isInCodeBlock;
      }
      if (isInCodeBlock) {
        return line; // run no transforms in code block
      }
      return line
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
        .replace(PATTERNS.obsidian.todo.checked, "$1+");
    })
    .join("\n");
  return text.replace(SYNC.patterns.uuid, "");
}

function appendUUID(text: string, uuid: string): string {
  return text + `\n<!-- {BearID:${uuid}} -->\n`;
}
