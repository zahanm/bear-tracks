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
mkdir /usr/local/var/log/
touch /usr/local/var/log/edu.zahanm.bear-tracks.log
ln -s ./config/logrotate.conf /usr/local/etc/logrotate.d/edu.zahanm.bear-tracks.conf
```
