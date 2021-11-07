import { assert } from "console";
import * as moment from "moment";
import {
  bearApiCreateNote,
  bearApiEditNote,
  DEFAULT_OPTIONS,
} from "./bearXCallback";

export interface Note {
  title: string;
}

export async function createDailyNote(
  opts: Record<string, any>,
  now: moment.Moment
): Promise<Note> {
  assert(now.day() != 6); // Don't run this on Saturday (ie, there is no daily note for Sunday)
  const tomorrow = now.clone().add(1, "day");
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

  // Add link to this note to the bottom of the weekly note
  const thisWeek = weeklyTitle(tomorrow);
  const link = `* [[${title}]]
`;
  if (opts.debug) {
    console.error(`Edit: ${thisWeek}`);
  }
  await bearApiEditNote(opts, {
    mode: "append",
    title: thisWeek,
    text: link,
    ...DEFAULT_OPTIONS,
  });

  // Return newly created note
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
  const title = weeklyTitle(now.clone().add(3, "days"));
  const previousTitle = weeklyTitle(now.clone().subtract(3, "days"));
  const body = `## Work

## Me

## Home

## Travel

## Social

#plans/weekly

## Links
* Previous: [[${previousTitle}]]
`;
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
