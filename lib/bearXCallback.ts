import { stringify, ParsedUrlQueryInput } from "querystring";
import { spawnSync } from "child_process";

export interface CREATE_NOTE_OPTIONS extends ParsedUrlQueryInput {
  show_window: string;
  open_note: string;
  pin?: string;
  title?: string;
  text: string;
}

export const DEFAULT_OPTIONS = {
  show_window: "no",
  open_note: "no",
};

export enum XCommand {
  CREATE,
  EDIT,
}

export async function bearApiCreateNote(
  opts: Record<string, any>,
  options: CREATE_NOTE_OPTIONS
) {
  await bearXCallback(opts, XCommand.CREATE, options);
}

/**
 * Refer to https://bear.app/faq/X-callback-url%20Scheme%20documentation/
 *
 * @param command Which API endpoint to call
 * @param options Parameters for API
 */
export async function bearXCallback(
  opts: Record<string, any>,
  command: XCommand,
  options: ParsedUrlQueryInput
) {
  const x_url = getXURL(command);
  const q_string = stringify(options);
  const x_command = `${x_url}?${q_string}`;
  if (opts.debug) {
    console.error(`open -g "${x_command}"`);
  }
  if (!opts.write) {
    throw new Error(
      `Need to specify --write in order to mutate Bear.app data"`
    );
  }
  const { error } = spawnSync("open", ["-g", x_command]);
  if (error) {
    throw error;
  }
}

function getXURL(command: XCommand): string {
  switch (command) {
    case XCommand.CREATE:
      return "bear://x-callback-url/create";
    case XCommand.EDIT:
      return "bear://x-callback-url/add-text";
  }
}
