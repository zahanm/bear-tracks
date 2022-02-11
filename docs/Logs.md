# Logs

## Pre-req

```
brew install logrotate
```

## Setup

You need to run this.

```
bear-tracks setup-logs
```

Which does this under the hood.

```
mkdir /Users/zahanm/homebrew/var/log/
touch /Users/zahanm/homebrew/var/log/edu.zahanm.bear-tracks.log
ln -s ./config/logrotate.conf /Users/zahanm/homebrew/etc/logrotate.d/edu.zahanm.bear-tracks.conf
```
