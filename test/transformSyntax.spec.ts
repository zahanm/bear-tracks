import { equal } from "assert";
import { transformToObsidian, transformToBear } from "../lib/transformSyntax";

const bear_note = `# Hello World

Hope you are doing well!

::This is a highlight.::

#these/are/nested/tags #another

#hashtag

- An unordered todo list
- of things
+ some checked
- some not
  - some indented
- others not

+ all
+ checked

- all
- unchecked
`;

const obsidian_note = `# Hello World

Hope you are doing well!

::This is a highlight.::

#these/are/nested/tags #another

#hashtag

- An unordered todo list
- of things
+ some checked
- some not
  - some indented
- others not

+ all
+ checked

- all
- unchecked
`;

describe("Bear.app <> Obsidian.app syntax transformer ", () => {
  it("should transform Bear.app -> Obsidian.app", async () => {
    equal(await transformToObsidian({}, bear_note), obsidian_note);
  });

  it("should transform Obsidian.app -> Bear.app", async () => {
    equal(await transformToBear({}, obsidian_note), bear_note);
  });
});