# Sync FAQs

## Title

I expect that your note starts with

```
# Title Here
```

and give it the name `Title Here`.

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
