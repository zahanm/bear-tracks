import { equal, ok } from "assert";
import { isValidFilename } from "../lib/invalidFilenames";

describe("Valid filename checker", () => {
  const valid_name = "foo bar";
  it(`should let a valid name pass: ${valid_name}`, () => {
    ok(isValidFilename(valid_name));
  });
  const invalidNames = [
    "foo@bar",
    "foo!bar",
    "foo bar?",
    "foo/bar",
    "foo:bar",
    "foo~bar",
    "foo.bar",
    "foo$bar",
    "foobar-",
  ];
  invalidNames.forEach((name) => {
    it(`should catch an invalid name: ${name}`, () => {
      equal(isValidFilename(name), false);
    });
  });
});
