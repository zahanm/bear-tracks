import { Database } from "sqlite";
import { BEAR_DB, FILENAME_PATTERNS } from "./constants";

export default async function invalidFilenames(
  db: Database
): Promise<string[]> {
  return [];
  const rows = await db.all(
    `select distinct ${BEAR_DB.notes.cols.title} as title
      from ${BEAR_DB.notes.name}
      where ${BEAR_DB.notes.cols.trashed} like '0'`
  );
  const titles = rows.map((row) => row.title);
}

export function isValidFilename(title: string): boolean {
  return (
    !FILENAME_PATTERNS.invalid.test(title) &&
    !FILENAME_PATTERNS.ends_in_dash.test(title)
  );
}
