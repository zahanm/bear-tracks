import { FILENAME_PATTERNS } from "./constants";

export default function transformTitleToFilename(title: string): string {
  return title.replace(new RegExp(FILENAME_PATTERNS.invalid, "g"), "-").trim();
}
