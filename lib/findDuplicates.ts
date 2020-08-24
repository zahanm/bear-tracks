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
 *
 * @returns List of Notes which have a duplicate title
 */
export async function findDuplicateNotes(
  opts: Record<string, any>,
  db: Database,
  prefetchedNotes?: Note[]
): Promise<Note[]> {
  let notes;
  if (!prefetchedNotes) {
    notes = await getAllNotes(opts, db);
  } else {
    notes = prefetchedNotes;
  }
  // check for duplicates by filename
  const duplicateFilenameCounts = duplicateCounts(notes);
  const duplicateFilenames = new Set(
    duplicateFilenameCounts.map((count) => count.value)
  );
  return notes.filter((note) =>
    duplicateFilenames.has(note.filename.toLowerCase())
  );
}

/**
 * @returns List of note titles with their respective counts.
 * You can think of it as a { title => count } map.
 */
export async function findDuplicateNoteCounts(
  opts: Record<string, any>,
  db: Database
): Promise<TitleCount[]> {
  const notes = await getAllNotes(opts, db);
  const filenames = notes.map((note) => note.filename.toLowerCase());
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
  return countValues(
    notes.map((note) => note.filename).map((name) => name.toLowerCase())
  ).filter((val) => {
    return val.count > 1;
  });
}
