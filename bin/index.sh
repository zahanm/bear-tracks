#!/usr/bin/env zsh

pushd /Users/zahanm/source/bear-tracks/
yarn ts-node --script-mode index.ts "$@"
popd
