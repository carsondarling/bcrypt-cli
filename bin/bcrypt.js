#!/usr/bin/env node
var package = require('../package.json');
var bcrypt = require('bcrypt');
var ArgumentParser = require('argparse').ArgumentParser;

var parser = new ArgumentParser({
  add_help: true,
  description: 'Bcrypt ALL the things!',
});

parser.add_argument('-v', '--version', {
  action: 'version',
  version: package.version,
});

parser.add_argument('-s', '--salt', {
  help: 'Pre-generated salt',
});

parser.add_argument('-V', '--verbose', {
  action: 'store_true',
  help: 'Enable verbose output',
});

parser.add_argument('-r', '--rounds', {
  help: 'Number of rounds to use (default 10)',
  default: 10,
  type: 'int',
});

parser.add_argument('rawText', {
  nargs: '?',
  help: 'The data to encrypt',
});

var args = parser.parse_args();

// Handle various input options
if (args.rawText) {
  processInput(null, args.rawText);
} else if (process.stdin.isTTY) {
  readTTY(processInput);
} else {
  readFile(processInput);
}

/**
 * Helpers
 * =============================================================================
 */

/**
 * Take input, run it through bcrypt with the right parameters, and output
 * results.
 */
function processInput(err, input) {
  if (err) return process.exit(1);

  if (args.verbose)
    console.error('Generating salt with %s rounds.', args.rounds);
  var salt = bcrypt.genSaltSync(args.rounds);

  if (args.verbose) console.error('Generating hash.');
  var hash = bcrypt.hashSync(input, salt);

  if (args.verbose) process.stderr.write('Output: ');
  process.stdout.write(hash);
  if (args.verbose) process.stderr.write('\n');
}

/**
 * Read stdin as a pipe
 */
function readFile(callback) {
  stdInput = '';
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', function (chunk) {
    stdInput += chunk;
  });

  process.stdin.on('end', function () {
    callback(null, stdInput);
  });

  process.stdin.on('error', callback);

  process.stdin.resume();
}

/**
 * Read stdin as a TTY
 */
function readTTY(callback) {
  // Display prompt
  process.stderr.write('Raw text: ');

  var stdInput = '';
  process.stdin.setEncoding('utf8');
  process.stdin.setRawMode(true);

  process.stdin.on('error', callback);

  process.stdin.on('data', function (chunk) {
    switch (chunk) {
      // They've finished typing their password
      case '\n':
      case '\r':
      case '\u0004':
        process.stderr.write('\n');
        process.stdin.setRawMode(false);
        process.stdin.pause();
        callback(null, stdInput);
        break;

      // Ctrl-C
      case '\u0003':
        process.stderr.write('\n');
        process.exit(1);
        break;

      // More passsword characters
      default:
        process.stderr.write('*');
        stdInput += chunk;
        break;
    }
  });

  process.stdin.resume();
}
