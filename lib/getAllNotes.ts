import { Database } from "sqlite";
import { BEAR_DB } from "./constants";
import transformTitleToFilename from "./transformTitle";

export interface Note {
  uuid: string;
  title: string;
  filename: string;
  creation_date: Date;
}

export async function getAllNotes(db: Database): Promise<Note[]> {
  const rows = await db.all(
    `select ${BEAR_DB.notes.cols.title} as title,
      ${BEAR_DB.notes.cols.uuid} as uuid,
      datetime(${BEAR_DB.notes.cols.creation_date},'unixepoch','31 years','localtime') as creation_date
      from ${BEAR_DB.notes.name}
      where ${BEAR_DB.notes.cols.trashed} like '0'`
  );
  return rows.map((row) => {
    return {
      uuid: row.uuid,
      title: row.title,
      filename: transformTitleToFilename(row.title),
      creation_date: new Date(row.creation_date),
    };
  });
}
