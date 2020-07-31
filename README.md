# Bear Tracks

Scripts to automate some actions in Bear.app

To run the script

```
./bin/index.sh help
```

To run tests

```
yarn test
```

The commands:

## `duplicates`, `invalids`, and `de-duplicate`

I'm looking for duplicate note titles that would collide when used with https://github.com/zahanm/Bear-Markdown-Export
Hence, I de-duplicate based on the file name of each note.

TSIA for `de-duplicate` - I add the creation date to the title.

Invalid note titles are those with characters that can't be used on a filesystem. Turns out, it doesn't matter since `Bear-Markdown-Export` embeds the note ID in the text. (And strips it out on re-import.)

## `create`, and `install-agent`

Make my "daily" and "weekly" notes. I've hooked this up to a launchd agent, which I installed with `install-agent`.
