import { Database } from "sqlite";
import { BEAR_DB, FILENAME_PATTERNS, LINK_PATTERNS } from "./constants";
import { Note } from "./getAllNotes";

export async function invalidFilenames(
  opts: Record<string, any>,
  db: Database,
  notes?: Note[]
): Promise<string[]> {
  let titles;
  if (!notes) {
    titles = await noteTitles(opts, db);
  } else {
    titles = notes.map((note) => note.title);
  }
  return titles.filter((title) => !isValidFilename(title));
}

export async function invalidLinks(
  opts: Record<string, any>,
  db: Database
): Promise<string[]> {
  const titles = await noteTitles(opts, db);
  return titles.filter((title) => !isValidLink(title));
}

async function noteTitles(
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
  return rows.map((row) => row.title);
}

export function isValidFilename(title: string): boolean {
  return !FILENAME_PATTERNS.invalid.test(title);
}

export function isValidLink(title: string): boolean {
  return !LINK_PATTERNS.invalid.test(title);
}
