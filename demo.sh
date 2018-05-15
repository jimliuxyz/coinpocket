#!/bin/bash

testrpc --account="0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef,1000000000000000000000000000000000000000" > /dev/null &

sleep 3

truffle migrate --reset

node server/server.js
