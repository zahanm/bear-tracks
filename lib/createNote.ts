import { ParsedUrlQueryInput } from "querystring";
import * as moment from "moment";
import { CreateNoteType } from "./constants";
import { bearXCallback, DEFAULT_OPTIONS, XCommand } from "./bearXCallback";

export interface Note {
  title: string;
}

export async function createNote(
  opts: Record<string, any>,
  type: CreateNoteType
): Promise<Note> {
  switch (type) {
    case CreateNoteType.DAILY:
      return await createDailyNote(opts);
    case CreateNoteType.WEEKLY:
      return await createWeeklyNote(opts);
  }
}

interface CREATE_NOTE_OPTIONS extends ParsedUrlQueryInput {
  show_window: string;
  open_note: string;
  pin?: string;
  title: string;
  text: string;
}

async function createDailyNote(opts: Record<string, any>): Promise<Note> {
  const title = moment().format("ddd - MMM D, YYYY");
  const body = `## Plan

## Done`;
  await bearApiCreateNote(opts, {
    title,
    text: body,
    pin: "yes",
    ...DEFAULT_OPTIONS,
  });
  return {
    title,
  };
}

async function createWeeklyNote(opts: Record<string, any>): Promise<Note> {
  const end_of_week = moment().add(6, "days");
  const title = `Plan for ${moment().format("MMM D")} - ${end_of_week.format(
    "MMM D, YYYY"
  )}`;
  const body = `## Work

## Me

## Home

## Social

## Daily`;
  await bearApiCreateNote(opts, {
    title,
    text: body,
    ...DEFAULT_OPTIONS,
  });
  return {
    title,
  };
}

async function bearApiCreateNote(
  opts: Record<string, any>,
  options: CREATE_NOTE_OPTIONS
) {
  await bearXCallback(opts, XCommand.CREATE, options);
}
