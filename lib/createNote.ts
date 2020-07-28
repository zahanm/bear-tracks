import { stringify as qstringify } from "querystring";
import * as moment from "moment";

export enum CreateType {
  DAILY = "daily",
  WEEKLY = "weekly",
}

export interface Note {
  title: string;
}

export async function createNote(type: CreateType): Promise<Note> {
  switch (type) {
    case CreateType.DAILY:
      return await createDailyNote();
    case CreateType.WEEKLY:
      return await createWeeklyNote();
  }
}

async function createDailyNote(): Promise<Note> {
  const title = moment().format("ddd - MMM D, YYYY");
  await bearXCallback(title, "Foo");
  return {
    title,
  };
}

async function createWeeklyNote(): Promise<Note> {
  const end_of_week = moment().add(6, "days");
  const title = `Plan for ${moment().format("MMM D")} - ${end_of_week.format(
    "MMM D, YYYY"
  )}`;
  await bearXCallback(title, "Bar");
  return {
    title,
  };
}

/**
 * Refer to https://bear.app/faq/X-callback-url%20Scheme%20documentation/
 *
 * @param title Note title.
 * @param md_text Note body, as Markdown.
 */
async function bearXCallback(title: string, md_text: string) {
  const x_create = "bear://x-callback-url/create";
  const q_string = qstringify({
    show_window: "no",
    open_note: "no",
    pin: "yes",
    title: title,
    text: md_text,
  });
  const x_command = `${x_create}?${q_string}`;
  console.error(`open -g ${x_command}`);
}
