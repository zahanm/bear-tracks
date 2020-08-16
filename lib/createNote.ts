import * as moment from "moment";
import { bearApiCreateNote, DEFAULT_OPTIONS } from "./bearXCallback";

export interface Note {
  title: string;
}

export async function createDailyNote(
  opts: Record<string, any>
): Promise<Note> {
  const title = moment().format("ddd - MMM D, YYYY");
  const body = `## Plan

## Done`;
  if (opts.debug) {
    console.error(`Create: ${title}`);
  }
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

export async function createWeeklyNote(
  opts: Record<string, any>
): Promise<Note> {
  const start = moment().add(1, "week").startOf("week");
  const end = moment().add(1, "week").endOf("week");
  const title = `Plan for ${start.format("MMM D")} - ${end.format(
    "MMM D, YYYY"
  )}`;
  const body = `## Work

## Me

## Home

## Social

## Daily`;
  if (opts.debug) {
    console.error(`Create: ${title}`);
  }
  await bearApiCreateNote(opts, {
    title,
    text: body,
    ...DEFAULT_OPTIONS,
  });
  return {
    title,
  };
}
