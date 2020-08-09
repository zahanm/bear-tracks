const PATTERNS = {
  bear: {
    highlight: /(^|\s)\:\:(\S(.*?)\S)?\:\:/gm,
  },
  obsidian: {
    highlight: /(^|\s)\=\=(\S(.*?)\S)?\=\=/gm,
  },
};

export async function transformToObsidian(
  opts: Record<string, any>,
  content: string
): Promise<string> {
  return content.replace(PATTERNS.bear.highlight, "$1==$2==");
}

export async function transformToBear(
  opts: Record<string, any>,
  content: string
): Promise<string> {
  return content.replace(PATTERNS.obsidian.highlight, `$1::$2::`);
}
