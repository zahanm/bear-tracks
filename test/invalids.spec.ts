import { equal, ok } from "assert";
import { isValidFilename, isValidLink } from "../lib/invalids";

describe("Valid filename checker", () => {
  const validNames = [
    "foo bar",
    "foo@bar",
    "foo!bar",
    "foo bar?",
    "foo~bar",
    "foo.bar",
    "foo$bar",
    "foobar-",
    "foo, bar",
    "!foo bar",
  ];
  validNames.forEach((name) => {
    it(`should let a valid name pass: ${name}`, () => {
      ok(isValidFilename(name));
      ok(isValidLink(name));
    });
  });
  const invalidNames = [
    "foo / bar",
    "foo | bar",
    "foo: bar",
    "foo/bar/baz/zub",
  ];
  invalidNames.forEach((name) => {
    it(`should catch an invalid filename: ${name}`, () => {
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
    it(`should catch an invalid link name: ${name}`, () => {
      equal(isValidLink(name), false);
    });
  });
});
