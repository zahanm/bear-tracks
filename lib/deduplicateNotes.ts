import { Database } from "sqlite";
import * as moment from "moment";

import { findDuplicateNotes } from "./findDuplicates";

export async function deduplicateNotes(db: Database) {
  const duplicates = await findDuplicateNotes(db);
  console.log(`# of notes: ${duplicates.length}`);
  duplicates.forEach((note) => {
    console.log(
      `${note.title} - ${moment(note.creation_date).format("MMM D, YYYY")}`
    );
  });
}
