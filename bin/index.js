#!/usr/bin/env node
const { program } = require('commander')
const { CLI_CONFIG } = require('./cli.js')
const packageJson = require('../package.json')

program.version(packageJson.version)

for (let item of CLI_CONFIG) {
  program.command(item.command).description(item.description).action(item.action)
}

program.parse(process.argv)
