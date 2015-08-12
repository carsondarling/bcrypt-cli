# Bcrypt-CLI

Provides basic tools for working with bcrypt. These are definitely not "battle-hardened", or production-worth, just something I threw together to make it a bit easier during development.

Package provides two scripts: **bcrypt** and **debcrypt**.

Both scripts have 3 different input options for the raw text: (1) via positional arguments, (2) via standard input, (3) via a password-like prompt.

In addition, **bcrypt** only outputs the hashed value to `stdout`, so that it works well with piping.

### Installation

```
npm install -g @carsondarling/bcrypt-cli
```

### Example Usage

```bash
$ bcrypt
Raw text: ****************
$2a$10$r7mriA5IanZFDLlpNRzqzuqiJKDXYrxczqdLK9PC5iASl43lGCXi6

$ bcrypt raw-text
$2a$10$vjmnk..OEgxkHxI0.Nw8u.nXDA.pERxqiboSP4WqOoqkLwM/2dE4C

$ cat filename | bcrypt
$2a$10$3Bp6aDK3gVLI7xmlnK5i2.vPwR5BV51vJu3O6Pp0aApDHoHkVex.m

$ debcrypt '$2a$10$vjmnk..OEgxkHxI0.Nw8u.nXDA.pERxqiboSP4WqOoqkLwM/2dE4C'
Raw text: ********
Match!

$ debcrypt '$2a$10$vjmnk..OEgxkHxI0.Nw8u.nXDA.pERxqiboSP4WqOoqkLwM/2dE4C' raw-text
Match!

$ echo -n 'raw-text' | debcrypt '$2a$10$vjmnk..OEgxkHxI0.Nw8u.nXDA.pERxqiboSP4WqOoqkLwM/2dE4C'
Match!

$ debcrypt $(bcrypt test-secret) test-secret
Match!

# On OS X:
$ bcrypt | pbcopy
Raw text: *******************

$ pbpaste
$2a$10$7l34S./5Cx4fZvq16LBiMux/2iM0Rb6St96uedoAo/w6Y.Y0aYsf6
```

### bcrypt

```
usage: bcrypt [-h] [-v] [-s SALT] [-V] [-r ROUNDS] [rawText]

Bcrypt ALL the things!

Positional arguments:
  rawText               The data to encrypt

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -s SALT, --salt SALT  Pre-generated salt
  -V, --verbose         Enable verbose output
  -r ROUNDS, --rounds ROUNDS
                        Number of rounds to use (default 10)
```

### debcrypt

```
usage: debcrypt [-h] [-v] [-Q] hash [rawText]

Check a value against it's bcrypted hash

Positional arguments:
  hash           The bcrypted hash
  rawText        The raw text to check

Optional arguments:
  -h, --help     Show this help message and exit.
  -v, --version  Show program's version number and exit.
  -Q, --quiet    Disable verbose output
```
