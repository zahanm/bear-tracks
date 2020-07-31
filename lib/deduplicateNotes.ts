import { Database } from "sqlite";
import * as moment from "moment";

import { findDuplicateNotes } from "./findDuplicates";
import { XCommand, bearXCallback, DEFAULT_OPTIONS } from "./bearXCallback";

export async function deduplicateNotes(
  opts: Record<string, any>,
  db: Database
) {
  const duplicates = await findDuplicateNotes(opts, db);
  console.error(`# of dupes: ${duplicates.length}`);
  for (const note of duplicates) {
    const creation = moment(note.creation_date);
    const newTitle = `${note.title} - ${creation.format("MMM D, YYYY")}`;
    const lines = note.text.split("\n");
    lines.shift();
    lines.unshift(`# ${newTitle}`);
    const newText = lines.join("\n");
    await bearXCallback(opts, XCommand.EDIT, {
      id: note.uuid,
      mode: "replace_all",
      text: newText,
      ...DEFAULT_OPTIONS,
    });
    console.error(newTitle);
  }
}
