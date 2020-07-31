import { Database } from "sqlite";
import { BEAR_DB, FILENAME_PATTERNS } from "./constants";

export default async function missingTitles(
  opts: Record<string, any>,
  db: Database
): Promise<string[]> {
  const query = `
    select ${BEAR_DB.notes.cols.title} as title,
      ${BEAR_DB.notes.cols.text} as text
      from ${BEAR_DB.notes.name}
      where ${BEAR_DB.notes.cols.trashed} like '0'`;
  if (opts.debug) {
    console.error(query);
  }
  const rows = await db.all(query);
  const missingTitles = rows
    .filter((row) => noTitle(row.text))
    .map((row) => row.title);
  if (opts.debug) {
    console.error(missingTitles.length);
  }
  return missingTitles;
}

function noTitle(text: string): boolean {
  const firstLine: string = text.split("\n")[0];
  return !firstLine.startsWith("# ");
}
