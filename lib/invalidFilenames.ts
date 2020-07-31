import { Database } from "sqlite";
import { BEAR_DB, FILENAME_PATTERNS } from "./constants";

export default async function invalidFilenames(
  opts: Record<string, any>,
  db: Database
): Promise<string[]> {
  const query = `
    select distinct ${BEAR_DB.notes.cols.title} as title
      from ${BEAR_DB.notes.name}
      where ${BEAR_DB.notes.cols.trashed} like '0'`;
  if (opts.debug) {
    console.error(query);
  }
  const rows = await db.all(query);
  return rows
    .map((row) => row.title)
    .filter((title) => !isValidFilename(title));
}

export function isValidFilename(title: string): boolean {
  return (
    !FILENAME_PATTERNS.invalid.test(title) &&
    !FILENAME_PATTERNS.ends_in_dash.test(title)
  );
}
