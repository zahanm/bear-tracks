import { spawnSync } from "child_process";
import { stringify as qstringify, ParsedUrlQueryInput } from "querystring";
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

interface CREATE_NOTE_OPTIONS extends ParsedUrlQueryInput {
  show_window: string;
  open_note: string;
  pin?: string;
  title: string;
  text: string;
}

const DEFAULT_OPTIONS = {
  show_window: "no",
  open_note: "no",
};

async function createDailyNote(): Promise<Note> {
  const title = moment().format("ddd - MMM D, YYYY");
  const body = `## Plan

## Done`;
  await bearXCallback({
    title,
    text: body,
    pin: "yes",
    ...DEFAULT_OPTIONS,
  });
  return {
    title,
  };
}

async function createWeeklyNote(): Promise<Note> {
  const end_of_week = moment().add(6, "days");
  const title = `Plan for ${moment().format("MMM D")} - ${end_of_week.format(
    "MMM D, YYYY"
  )}`;
  const body = `## Work

## Me

## Home

## Social

## Daily`;
  await bearXCallback({
    title,
    text: body,
    ...DEFAULT_OPTIONS,
  });
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
async function bearXCallback(options: CREATE_NOTE_OPTIONS) {
  const x_create = "bear://x-callback-url/create";
  const q_string = qstringify(options);
  const x_command = `${x_create}?${q_string}`;
  console.error(`open -g "${x_command}"`);
  const { error } = spawnSync("open", ["-g", x_command]);
  if (error) {
    throw error;
  }
}
