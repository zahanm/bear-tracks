import { stringify, ParsedUrlQueryInput } from "querystring";
import { spawnSync } from "child_process";

export const DEFAULT_OPTIONS = {
  show_window: "no",
  open_note: "no",
};

export enum XCommand {
  CREATE,
  EDIT,
}

/**
 * Refer to https://bear.app/faq/X-callback-url%20Scheme%20documentation/
 *
 * @param command Which API endpoint to call
 * @param options Parameters for API
 */
export async function bearXCallback(
  command: XCommand,
  options: ParsedUrlQueryInput
) {
  const x_url = getXURL(command);
  const q_string = stringify(options);
  const x_command = `${x_url}?${q_string}`;
  console.error(`open -g "${x_command}"`);
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
