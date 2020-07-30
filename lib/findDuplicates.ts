import { Database } from "sqlite";
import { BEAR_DB } from "./constants";
import transformTitleToFilename from "./transformTitle";
import { countValues, Count } from "./countValues";

export interface TitleCount {
  title: string;
  count: number;
}

interface Note {
  uuid: string;
  title: string;
  filename: string;
}

export async function findDuplicateNotes(db: Database): Promise<Note[]> {
  const notes = await getAllNotes(db);
  // check for duplicates by filename
  const duplicateFilenameCounts = duplicateCounts(notes);
  const duplicateFilenames = new Set(
    duplicateFilenameCounts.map((count) => count.value)
  );
  return notes.filter((note) => duplicateFilenames.has(note.filename));
}

export async function findDuplicateNoteCounts(
  db: Database
): Promise<TitleCount[]> {
  const notes = await getAllNotes(db);
  const filenames = notes.map((note) => note.filename);
  return countValues(notes.map((note) => note.filename))
    .filter((val) => {
      return val.count > 1;
    })
    .map((val) => {
      const filename = val.value,
        count = val.count;
      return {
        title: notes[filenames.indexOf(filename)].title,
        count: count,
      };
    })
    .sort((a, b) => {
      // reverse sort by count
      return b.count - a.count;
    });
}

/**
 * Check for duplicates by filename
 */
function duplicateCounts(notes: Note[]): Count[] {
  return countValues(notes.map((note) => note.filename)).filter((val) => {
    return val.count > 1;
  });
}

/**
 * We can't just do this with a group-by in SQL because the titles
 * need to be transformed into filenames first
 */
async function getAllNotes(db: Database): Promise<Note[]> {
  const rows = await db.all(
    `select ${BEAR_DB.notes.cols.title} as title,
      ${BEAR_DB.notes.cols.uuid} as uuid
      from ${BEAR_DB.notes.name}
      where ${BEAR_DB.notes.cols.trashed} like '0'`
  );
  return rows.map((row) => {
    return {
      uuid: row.uuid,
      title: row.title,
      filename: transformTitleToFilename(row.title),
    };
  });
}
