const PATTERNS = {
  bear: {
    highlight: /(^|\s)\:\:(\S(.*?)\S)?\:\:/gm,
    nested_tags: /\#\b([\w \-]*\/)+/gm,
  },
  obsidian: {
    highlight: /(^|\s)\=\=(\S(.*?)\S)?\=\=/gm,
    nested_tags: /\#\b([\w \-]*\_)+/gm,
  },
};

export async function transformToObsidian(
  opts: Record<string, any>,
  content: string
): Promise<string> {
  const t1 = content.replace(PATTERNS.bear.highlight, "$1==$2==");
  return t1.replace(PATTERNS.bear.nested_tags, (match: string) => {
    return match.replace(/\//g, "_");
  });
}

export async function transformToBear(
  opts: Record<string, any>,
  content: string
): Promise<string> {
  const t1 = content.replace(PATTERNS.obsidian.highlight, `$1::$2::`);
  return t1.replace(PATTERNS.obsidian.nested_tags, (match: string) => {
    return match.replace(/\_/g, "/");
  });
}
