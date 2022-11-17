#!/usr/bin/env node

const vorpal = require('vorpal')();
vorpal.use(require('../src/index.js'));
// vorpal.use(require('../src/testcli.js'));