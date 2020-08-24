import * as fs from "fs/promises";
import * as path from "path";

import { fileExists } from "./utils";

interface NoteLinkList {
  title: string;
  links: string[];
}

/**
 * Traverses the filesystem of the provided directory.
 * Collects all the notes, all the links, and then returns the "orphans".
 */
export async function findOrphanedLinks(
  opts: Record<string, any>,
  notesDir: string
) {
  if (!(await fileExists(notesDir))) {
    throw new Error(`${notesDir} is not a valid path.`);
  }
  const stat = await fs.stat(notesDir);
  if (!stat.isDirectory()) {
    throw new Error(`${notesDir} is not a valid directory.`);
  }
  const noteTitles = new Set<string>();
  const noteLinks: NoteLinkList[] = [];
  for await (const entry of await fs.opendir(notesDir)) {
    if (path.extname(entry.name) != ".md") {
      console.error(`Skip (unsupported file type): ${entry.name}`);
      continue;
    }
    const title = path.basename(entry.name, ".md");
    noteTitles.add(title);
    const text = await fs.readFile(path.join(notesDir, entry.name), {
      encoding: "utf-8",
    });
    const links = extractLinks(text);
    if (links.length > 0) {
      noteLinks.push({
        title,
        links,
      });
    }
  }
  console.error(`We found ${noteTitles.size} notes.`);
  console.error(`${noteLinks.length} of them have at least 1 link.`);
  console.error(`In total, there are ${countLinks(noteLinks)} links.`);

  const orphanedLinks = filterToOrphans(noteTitles, noteLinks);
  console.error(
    `And of those links, ${countLinks(orphanedLinks)} are orphaned:`
  );
  for (const linkList of orphanedLinks) {
    console.error(`\n> ${linkList.title}`);
    linkList.links.forEach((link) => {
      console.error(link);
    });
  }
}

const codeRegexps = {
  block: /^\`\`\`$.*?^\`\`\`$/gms,
  inline: /\`.*?\`/g,
};
const linkRegexp = /\[\[(.*?)\]\]/g;

/**
 * @returns list of link "names". ie, the "Foo Bar" in [[Foo Bar]].
 */
function extractLinks(text: string): string[] {
  const links: string[] = [];
  const textWithoutCode = text
    .replace(codeRegexps.block, "") // must call this before inline
    .replace(codeRegexps.inline, "");
  for (const match of textWithoutCode.matchAll(linkRegexp)) {
    links.push(match[1]);
  }
  return links;
}

function filterToOrphans(
  titles: Set<string>,
  noteLinks: NoteLinkList[]
): NoteLinkList[] {
  const orphaned: NoteLinkList[] = [];
  for (const linkList of noteLinks) {
    // Find all links that aren't in the list of note titles
    const orphanLinks = linkList.links.filter((link) => !titles.has(link));
    if (orphanLinks.length > 0) {
      orphaned.push({
        title: linkList.title,
        links: orphanLinks,
      });
    }
  }
  return orphaned;
}

function countLinks(linkLists: NoteLinkList[]): number {
  return linkLists.reduce((acc, n) => acc + n.links.length, 0);
}
