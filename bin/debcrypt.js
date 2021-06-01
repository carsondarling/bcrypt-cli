#!/usr/bin/env node
var package = require('../package.json');
var bcrypt = require('bcrypt');
var ArgumentParser = require('argparse').ArgumentParser;

var parser = new ArgumentParser({
  add_help: true,
  description: "Check a value against it's bcrypted hash",
});

parser.add_argument('-v', '--version', {
  action: 'version',
  version: package.version,
});

parser.add_argument('-Q', '--quiet', {
  action: 'store_true',
  help: 'Disable verbose output',
});

parser.add_argument('hash', {
  help: 'The bcrypted hash',
});

parser.add_argument('rawText', {
  nargs: '?',
  help: 'The raw text to check',
});

var args = parser.parse_args();

// Handle various input options
if (args.rawText) {
  processInput(null, args.hash, args.rawText);
} else if (process.stdin.isTTY) {
  readTTY(function (err, raw) {
    return processInput(err, args.hash, raw);
  });
} else {
  readPipe(function (err, raw) {
    return processInput(err, args.hash, raw);
  });
}

/**
 * Helpers
 * =============================================================================
 */

/**
 * Take input, run it through bcrypt with the right parameters, and output
 * results.
 */
function processInput(err, hash, raw) {
  if (err) return process.exit(1);

  bcrypt.compare(raw, hash, function (err, match) {
    if (err) {
      if (!args.quiet) console.error('Error checking hash: %s', err.message);
      return process.exit(1);
    }

    if (!match) {
      if (!args.quiet) console.error('Hash does not match.');
      return process.exit(1);
    }

    if (!args.quiet) console.error('Match!');
    return process.exit(0);
  });
}

/**
 * Read stdin as a pipe
 */
function readPipe(callback) {
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
