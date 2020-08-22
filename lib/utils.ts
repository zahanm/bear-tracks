import * as fs from "fs/promises";
import { Note } from "./getAllNotes";

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fileExists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export function retitleNote(note: Note, newTitle: string): Note {
  const lines = note.text.split("\n");
  lines.shift();
  lines.unshift(`# ${newTitle}`);
  const newText = lines.join("\n");
  return {
    ...note,
    title: newTitle,
    text: newText,
  };
}
