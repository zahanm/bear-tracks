import { Database } from "sqlite";
import { BEAR_DB } from "./constants";

export default async function findDuplicates(db: Database): Promise<string[]> {
  const rows = await db.all(
    `select ${BEAR_DB.notes.cols.title} as title
      from ${BEAR_DB.notes.name}
      where ${BEAR_DB.notes.cols.trashed} like '0'
      group by title
      having count(title) > 1`
  );
  return rows.map((row) => row.title);
}
