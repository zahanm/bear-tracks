import { assert } from "console";
import * as moment from "moment";
import { bearApiCreateNote, DEFAULT_OPTIONS } from "./bearXCallback";

export interface Note {
  title: string;
}

export async function createDailyNote(
  opts: Record<string, any>,
  now: moment.Moment
): Promise<Note> {
  const tomorrow = now.clone().add(1, "day");
  assert(tomorrow.day() != 0); // Don't run this on Saturday, for Sunday
  const title = dailyTitle(tomorrow);
  const body = `## Plan

## Done

#debrief/daily`;
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

function dailyTitle(at: moment.Moment): string {
  let title: string;
  if (at.day() === 6) {
    title = `Weekend - ${at.format("MMM D, YYYY")}`;
  } else {
    title = at.format("ddd - MMM D, YYYY");
  }
  return title;
}

export async function createWeeklyNote(
  opts: Record<string, any>,
  now: moment.Moment
): Promise<Note> {
  const title = weeklyTitle(now.clone().add(1, "week"));
  const previousTitle = weeklyTitle(now);
  const body = `## Work

## Me

## Home

## Travel

## Social

## Links
* Previous: [[${previousTitle}]]

#plans/weekly`;
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

function weeklyTitle(at: moment.Moment): string {
  const start = at.clone().startOf("week");
  const end = at.clone().endOf("week");
  const title = `Plan for ${start.format("MMM D")} - ${end.format(
    "MMM D, YYYY"
  )}`;
  return title;
}
