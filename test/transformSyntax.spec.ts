import { equal } from "assert";
import { transformToObsidian, transformToBear } from "../lib/transformSyntax";

const bear_note = `# Hello World

Hope you are doing well!

::This is a highlight.:: but this is not::
and ::another:: highlight.

#these/are/nested/tags #not
#mutli word/nested tags#
#tags-with/hypens

#trailing/slash/ (Do not use!)

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

==This is a highlight.== but this is not::
and ==another== highlight.

#these_are_nested_tags #not
#mutli word_nested tags#
#tags-with_hypens

#trailing_slash_ (Do not use!)

#hashtag

- [ ] An unordered todo list
- [ ] of things
- [x] some checked
- [ ] some not
  - [ ] some indented
- [ ] others not

- [x] all
- [x] checked

- [ ] all
- [ ] unchecked

<!-- {BearID:FOO-BAR-BAZ} -->
`;

describe("Bear.app <> Obsidian.app syntax transformer ", () => {
  it("should transform Bear.app -> Obsidian.app", async () => {
    equal(
      await transformToObsidian({}, bear_note, "FOO-BAR-BAZ"),
      obsidian_note
    );
  });

  it("should transform Obsidian.app -> Bear.app", async () => {
    equal(await transformToBear({}, obsidian_note), bear_note);
  });
});
