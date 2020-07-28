import { Database } from "sqlite";
import { BEAR_DB } from "./constants";
import transformTitleToFilename from "./transformTitle";

export default async function findDuplicates(db: Database): Promise<string[]> {
  // We can't just do this with a group-by in SQL because the titles
  // need to be transformed into filenames first
  const rows = await db.all(
    `select ${BEAR_DB.notes.cols.title} as title
      from ${BEAR_DB.notes.name}
      where ${BEAR_DB.notes.cols.trashed} like '0'`
  );
  const titles = rows.map((row) => row.title);
  const filenames = titles.map((title) => transformTitleToFilename(title));
  const non_unique_titles = titles.filter((_, index) => {
    // Check if there is another filename in filenames
    return filenames.indexOf(filenames[index]) != index;
  });
  // Unique the list (like, if there were 3 notes with the same title)
  return [...new Set(non_unique_titles)];
}
