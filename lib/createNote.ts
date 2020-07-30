import { ParsedUrlQueryInput } from "querystring";
import * as moment from "moment";
import { CreateNoteType } from "./constants";
import { bearXCallback, DEFAULT_OPTIONS, XCommand } from "./bearXCallback";

export interface Note {
  title: string;
}

export async function createNote(type: CreateNoteType): Promise<Note> {
  switch (type) {
    case CreateNoteType.DAILY:
      return await createDailyNote();
    case CreateNoteType.WEEKLY:
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

async function createDailyNote(): Promise<Note> {
  const title = moment().format("ddd - MMM D, YYYY");
  const body = `## Plan

## Done`;
  await bearApiCreateNote({
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
  await bearApiCreateNote({
    title,
    text: body,
    ...DEFAULT_OPTIONS,
  });
  return {
    title,
  };
}

async function bearApiCreateNote(options: CREATE_NOTE_OPTIONS) {
  await bearXCallback(XCommand.CREATE, options);
}
