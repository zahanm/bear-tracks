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
  assert(now.day() != 0 && now.day() != 7); // Don't run this on Sunday (ie, there is just a weekend note)
  const title = dailyTitle(now);
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
  const thisWeek = weeklyTitle(now);
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
  const body = `- Clear: scan post-its, voice memos → collect in Things [Inbox](things:///show?id=inbox), then clear it.
- Current: Fill out this note with a plan.
- Current: Go through [Anytime](things:///show?id=anytime) in Things. Focus on physical next action.
- Creative: Look at #tickler in Bear, and [Someday](things:///show?id=someday) in Things.

## Work

## Family

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

export async function createMonthlyNote(
  opts: Record<string, any>,
  now: moment.Moment
): Promise<Note> {
  const yesterday = now.clone().subtract(1, "day");
  // This is expected to run on the first day of the month
  assert(now.month() != yesterday.month());
  const title = monthlyTitle(yesterday);
  // Add link to this note to the bottom of the weekly note
  const lastMonth = yesterday.clone().subtract(1, "month");
  const lastMonthTitle = monthlyTitle(lastMonth);
  const body = `
Previous: [[${lastMonthTitle}]]

#debrief/monthly`;
  if (opts.debug) {
    console.error(`Create: ${title}`);
    console.error(body);
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

function monthlyTitle(at: moment.Moment): string {
  return `Monthly Review: ${at.format("MMMM YYYY")}`;
}
