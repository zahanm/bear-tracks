import { Database } from "sqlite";
import { BEAR_DB } from "./constants";
import transformTitleToFilename from "./transformTitle";

export interface Note {
  uuid: string;
  title: string;
  filename: string;
  text: string;
  creation_date: Date;
}

export async function getAllNotes(
  opts: Record<string, any>,
  db: Database
): Promise<Note[]> {
  const query = `
  select ${BEAR_DB.notes.cols.title} as title,
    ${BEAR_DB.notes.cols.uuid} as uuid,
    datetime(${BEAR_DB.notes.cols.creation_date}, 'unixepoch', '31 years', 'localtime') as creation_date,
    ${BEAR_DB.notes.cols.text} as text
    from ${BEAR_DB.notes.name}
    where ${BEAR_DB.notes.cols.trashed} like '0'`;
  if (opts.debug) {
    console.error(query);
  }
  const rows = await db.all(query);
  return rows.map((row) => {
    return {
      uuid: row.uuid,
      title: row.title,
      filename: transformTitleToFilename(row.title),
      text: row.text,
      creation_date: new Date(row.creation_date),
    };
  });
}
