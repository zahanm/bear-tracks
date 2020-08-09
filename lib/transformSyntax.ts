const PATTERNS = {
  bear: {
    highlight: /(^|\s)\:\:(\S(.*?)\S)?\:\:/gm,
    nested_tags: /\#\b([\w \-]*\/)+/gm,
    todo: {
      unchecked: /(^\s*)\-(?=\s\w)/gm,
      checked: /(^\s*)\+(?=\s\w)/gm,
    },
  },
  obsidian: {
    highlight: /(^|\s)\=\=(\S(.*?)\S)?\=\=/gm,
    nested_tags: /\#\b([\w \-]*\_)+/gm,
    todo: {
      unchecked: /(^\s*)\- \[ \](?=\s\w)/gm,
      checked: /(^\s*)\- \[x\](?=\s\w)/gm,
    },
  },
};

export async function transformToObsidian(
  opts: Record<string, any>,
  content: string
): Promise<string> {
  return content
    .replace(PATTERNS.bear.highlight, "$1==$2==")
    .replace(PATTERNS.bear.nested_tags, (match: string) => {
      return match.replace(/\//g, "_");
    })
    .replace(PATTERNS.bear.todo.unchecked, "$1- [ ]")
    .replace(PATTERNS.bear.todo.checked, "$1- [x]");
}

export async function transformToBear(
  opts: Record<string, any>,
  content: string
): Promise<string> {
  return content
    .replace(PATTERNS.obsidian.highlight, `$1::$2::`)
    .replace(PATTERNS.obsidian.nested_tags, (match: string) => {
      return match.replace(/\_/g, "/");
    })
    .replace(PATTERNS.obsidian.todo.unchecked, "$1-")
    .replace(PATTERNS.obsidian.todo.checked, "$1+");
}
