#!/usr/bin/env node
var package = require('../package.json');
var bcrypt = require('bcrypt');
var ArgumentParser = require('argparse').ArgumentParser;

var parser = new ArgumentParser({
  version: package.version,
  addHelp: true,
  description: 'Bcrypt ALL the things!'
});

parser.addArgument(['-s', '--salt'], {
  help: 'Pre-generated salt'
});

parser.addArgument(['-V', '--verbose'], {
  action: 'storeTrue',
  help: 'Enable verbose output'
});

parser.addArgument(['-r', '--rounds'], {
  help: 'Number of rounds to use (default 10)',
  defaultValue: 10,
  type: 'int'
});

parser.addArgument(['rawText' ], {
  help: 'The data to encrypt'
});

var args = parser.parseArgs();

if (args.verbose) console.error('Generating salt with %s rounds.', args.rounds);
var salt = bcrypt.genSaltSync(args.rounds);

if (args.verbose) console.error('Generating hash.');
var hash = bcrypt.hashSync(args.rawText, salt);

if (args.verbose) process.stderr.write('Output: ');
process.stdout.write(hash);
process.stderr.write('\n');
