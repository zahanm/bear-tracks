import { Database } from "sqlite";
import { countValues, Count } from "./countValues";
import { getAllNotes, Note } from "./getAllNotes";

export interface TitleCount {
  title: string;
  count: number;
}

/**
 * We can't just do this with a group-by in SQL because the titles
 * need to be transformed into filenames first
 */
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
  return duplicateCounts(notes)
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
