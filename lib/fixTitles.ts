import { Database } from "sqlite";
import { getNote } from "./getAllNotes";
import { retitleNote } from "./utils";
import { bearXCallback, XCommand, DEFAULT_OPTIONS } from "./bearXCallback";

export async function fixInvalidNoteTitles(
  opts: Record<string, any>,
  db: Database
) {
  const notes = [
    await getNote(
      opts,
      db,
      "0B7A51F6-3E94-460F-BFCD-CBD1BDEFB83F-28051-00005F14075BE18C"
    ),
  ];
  for (const note of notes) {
    console.error(`Invalid: ${note.title}`);
    const newNote = retitleNote(note, "Fuffles AC + Tire");
    await bearXCallback(opts, XCommand.EDIT, {
      id: note.uuid,
      mode: "replace_all",
      text: newNote.text,
      ...DEFAULT_OPTIONS,
    });
    console.error(`Fixed: ${newNote.title}`);
  }
}
