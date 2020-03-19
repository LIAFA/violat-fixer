[![Build Status](https://travis-ci.org/LIAFA/violat-fixer.svg?branch=master)](https://travis-ci.org/LIAFA/violat-fixer)
[![npm version](https://badge.fury.io/js/violat-fixer.svg)](https://badge.fury.io/js/violat-fixer)

# Violat Fixer

Suggests fixes for atomicity violations.

## Development

After cloning this repository, install package dependencies with npm:

```console
npm i
```

Ensure existing tests are passing:

```console
npm test
```

Then write new tests with each feature or fix, and ensure those tests also pass prior to pushing commits. Pushing failing tests will break [the Travis CI builds](https://travis-ci.org/github/LIAFA/violat-fixer), and yield a red build badge on this package.

## Releasing New Versions

Create a tagged commit with bumped version number (choose between `major`, `minor`, and `patch`):

```console
$ npm version [major|minor|patch]
```

Push the newly-generated commits and tags to github:

```console
$ git push && git push --tags
```

This initiates [Travis CI builds](https://travis-ci.org/github/LIAFA/violat-fixer) which ultimately publish tag-branch builds (e.g., named `v1.0.1`) to [npm](https://www.npmjs.com/package/violat-fixer).
