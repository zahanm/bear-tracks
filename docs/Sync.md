# Sync FAQs

## Caveats

This exports all your (not in trash, not archived) Bear.app notes to a folder in Markdown format.

- It doesn't attempt to bring images with it.
- There is no folder hierarchy imposed. Notes with duplicate names will be overwritten.

## Title

I expect that your note starts with

```
# Title Here
```

and give it the name `Title Here`.

## "Strict" mode

Highly recommended that you use this option: `--strict`. It will guarantee that
the exported set of notes matches the ones in Bear. It looks for invalid, missing,
or duplicate titles.

Mostly, this revolves around the fact that the title is the filename for the exported
note. And the internal links reference the note title as well, and it's how Obsidian
discovers those links.

## Conflicts

I check when the notes were last exported, and if the note
being imported has been modified in Bear.app after that,
I treat it as a conflict.

Then I import the conflicted file as a new note.

## Log

Look at documentation in `./Logs.md` for a history of your syncs and conflicts.

## Launch Agent (periodic sync)

I'm using [LaunchControl](https://www.soma-zone.com/LaunchControl/FAQ.html) and a bundled utility `fdautil` to handle the macOS "Full Disk Access" permission madness.

```
sudo fdautil set agent edu.zahanm.bear-tracks.sync /Users/zahanm/source/bear-tracks/bin/index.sh sync '/Users/zahanm/Documents/Bear Notes/' --write
```

To set it up.
