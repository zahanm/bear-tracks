import { Database } from "sqlite";
import * as moment from "moment";

import { findDuplicateNotes } from "./findDuplicates";
import { XCommand, bearXCallback, DEFAULT_OPTIONS } from "./bearXCallback";
import { retitleNote } from "./utils";

export async function deduplicateNotes(
  opts: Record<string, any>,
  db: Database
) {
  const duplicates = await findDuplicateNotes(opts, db);
  console.error(`# of dupes: ${duplicates.length}`);
  for (const note of duplicates) {
    const creation = moment(note.creation_date);
    const newTitle = `${note.title} - ${creation.format("MMM D, YYYY")}`;
    const newNote = retitleNote(note, newTitle);
    await bearXCallback(opts, XCommand.EDIT, {
      id: note.uuid,
      mode: "replace_all",
      text: newNote.text,
      ...DEFAULT_OPTIONS,
    });
    console.error(newTitle);
  }
}
