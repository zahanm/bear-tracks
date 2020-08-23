import { Database } from "sqlite";
import { BEAR_DB, FILENAME_PATTERNS, LINK_PATTERNS } from "./constants";

//#region fix

export async function fixInvalidNoteTitles(
  opts: Record<string, any>,
  db: Database
) {}

//#endregion

//#region invalids

export async function invalidFilenames(
  opts: Record<string, any>,
  db: Database
): Promise<string[]> {
  const titles = await noteTitles(opts, db);
  return titles.filter((title) => !isValidFilename(title));
}

export async function invalidLinks(
  opts: Record<string, any>,
  db: Database
): Promise<string[]> {
  const titles = await noteTitles(opts, db);
  return titles.filter((title) => !isValidLink(title));
}

export function isValidFilename(title: string): boolean {
  return !FILENAME_PATTERNS.invalid.test(title);
}

export function isValidLink(title: string): boolean {
  return !LINK_PATTERNS.invalid.test(title);
}

//#endregion

//#region missing

export async function missingTitles(
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

//#endregion

//#region transform

export function transformTitleToFilename(title: string): string {
  return title.replace(new RegExp(FILENAME_PATTERNS.invalid, "g"), "-").trim();
}

//#endregion

//#region utils

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

//#endregion
