import { Database } from "sqlite";
import { BEAR_DB } from "./constants";
import transformTitleToFilename from "./transformTitle";
import { countValues, Count } from "./countValues";

export interface TitleCount {
  title: string;
  count: number;
}

export default async function findDuplicates(
  db: Database
): Promise<Array<TitleCount>> {
  // We can't just do this with a group-by in SQL because the titles
  // need to be transformed into filenames first
  const rows = await db.all(
    `select ${BEAR_DB.notes.cols.title} as title
      from ${BEAR_DB.notes.name}
      where ${BEAR_DB.notes.cols.trashed} like '0'`
  );
  const titles = rows.map((row) => row.title);
  const filenames = titles.map((title) => transformTitleToFilename(title));
  return countValues(filenames)
    .filter((val) => {
      return val.count > 1;
    })
    .map((val) => {
      const filename = val.value,
        count = val.count;
      return {
        title: titles[filenames.indexOf(filename)],
        count: count,
      };
    })
    .sort((a, b) => {
      // reverse sort by count
      return b.count - a.count;
    });
}
