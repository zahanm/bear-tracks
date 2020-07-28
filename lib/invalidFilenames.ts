import { Database } from "sqlite";
import { BEAR_DB } from "./constants";

export default async function invalidFilenames(
  db: Database
): Promise<string[]> {
  const names = [
    "foo bar",
    "foo@bar",
    "foo!bar",
    "foo bar?",
    "foo/bar",
    "foo:bar",
    "foo~bar",
    "foo.bar",
    "foo$bar",
    "foobar-",
  ];
  names.forEach((name) => {
    console.log(`${name} => ${isValidFilename(name)}`);
  });
  return [];
  const rows = await db.all(
    `select distinct ${BEAR_DB.notes.cols.title} as title
      from ${BEAR_DB.notes.name}
      where ${BEAR_DB.notes.cols.trashed} like '0'`
  );
  const titles = rows.map((row) => row.title);
}

function isValidFilename(title: string): boolean {
  // keep in sync with https://github.com/zahanm/Bear-Markdown-Export
  // title = re.sub(r'[/\\*?$@!^&\|~:\.]', r'-', title)
  // title = re.sub(r'-$', r'', title)
  return !/[/\\*?$@!^&\|~:\.]/.test(title) && !/-$/.test(title);
}
