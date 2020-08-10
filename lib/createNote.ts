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
