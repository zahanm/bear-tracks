import { Database } from "sqlite";
import { getAllNotes } from "./getAllNotes";
import { retitleNote } from "./utils";
import { bearApiEditNote, DEFAULT_OPTIONS } from "./bearXCallback";
import { isValidFilename } from "./invalids";

export async function fixInvalidNoteTitles(
  opts: Record<string, any>,
  db: Database
) {
  const notes = (await getAllNotes(opts, db)).filter(
    (note) => !isValidFilename(note.title)
  );
  for (const note of notes) {
    console.error(`Invalid: ${note.title}`);
    // Uses the transformed title that already stripped out the
    // invalid characters
    const newNote = retitleNote(note, note.filename);
    await bearApiEditNote(opts, {
      id: note.uuid,
      mode: "replace_all",
      text: newNote.text,
      ...DEFAULT_OPTIONS,
    });
    console.error(`Fixed: ${newNote.title}`);
  }
}
