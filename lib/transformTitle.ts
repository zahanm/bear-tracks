import { FILENAME_PATTERNS } from "./constants";

export default function transformTitleToFilename(title: string): string {
  return title
    .replace(FILENAME_PATTERNS.invalid, "-")
    .replace(FILENAME_PATTERNS.ends_in_dash, "")
    .trim();
}
