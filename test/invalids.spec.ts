import { equal, ok } from "assert";
import { isValidFilename, isValidLink } from "../lib/invalids";

describe("Valid filename checker", () => {
  const valid_name = "foo bar";
  it(`should let a valid name pass: ${valid_name}`, () => {
    ok(isValidFilename(valid_name));
    ok(isValidLink(valid_name));
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
  const invalidLinks = [
    "foo|bar",
    "|",
    "foo bar|",
    "|foo bar",
    "foo||bar",
    "foo | bar",
  ];
  invalidLinks.forEach((name) => {
    it(`should catch an invalid name: ${name}`, () => {
      equal(isValidLink(name), false);
    });
  });
});
