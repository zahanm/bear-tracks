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
  const tomorrow = now.add(1, "day");
  let title: string;
  assert(tomorrow.day() != 0); // Don't run this on Saturday, for Sunday
  if (tomorrow.day() === 6) {
    title = `Weekend - ${tomorrow.format("MMM D, YYYY")}`;
  } else {
    title = tomorrow.format("ddd - MMM D, YYYY");
  }
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
