import { deepStrictEqual } from "assert";
import { extractLinks } from "../lib/orphanedLinks";

const bear_note = `# Hello World
[[Hello]] world, I wonder [[what you are]] doing.
[[This should not
work]].
But [[this should!]].
This [[won't work too.][
Should skip \`![[image]]\` too.
\`\`\`
And [[this]]
\`\`\`
`;

describe("Link extractor", () => {
  it("should find only the links we expect", async () => {
    deepStrictEqual(
      new Set(extractLinks(bear_note)),
      new Set(["Hello", "what you are", "this should!"])
    );
  });
});
