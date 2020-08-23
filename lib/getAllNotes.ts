import { Database } from "sqlite";
import { BEAR_DB } from "./constants";
import { transformTitleToFilename } from "./titles";

export interface Note {
  uuid: string;
  title: string;
  filename: string;
  text: string;
  creation_date: Date;
  modification_date: Date;
}

const selectCols = `
${BEAR_DB.notes.cols.title} as title,
  ${BEAR_DB.notes.cols.uuid} as uuid,
  datetime(${BEAR_DB.notes.cols.creation_date}, 'unixepoch', '31 years', 'localtime') as creation_date,
  datetime(${BEAR_DB.notes.cols.modification_date}, 'unixepoch', '31 years', 'localtime') as modification_date,
  ${BEAR_DB.notes.cols.text} as text
`.trim();

export async function getAllNotes(
  opts: Record<string, any>,
  db: Database
): Promise<Note[]> {
  const query = `
  select ${selectCols}
  from ${BEAR_DB.notes.name}
  where ${BEAR_DB.notes.cols.trashed} like '0'`.trim();
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
      modification_date: new Date(row.modification_date),
    };
  });
}

export async function getNote(
  opts: Record<string, any>,
  db: Database,
  uuid: string
): Promise<Note> {
  const query = `
  select ${selectCols}
  from ${BEAR_DB.notes.name}
  where ${BEAR_DB.notes.cols.uuid} = '${uuid}'`.trim();
  if (opts.debug) {
    console.error(query);
  }
  const row = await db.get(query);
  return {
    uuid: row.uuid,
    title: row.title,
    filename: transformTitleToFilename(row.title),
    text: row.text,
    creation_date: new Date(row.creation_date),
    modification_date: new Date(row.modification_date),
  };
}
