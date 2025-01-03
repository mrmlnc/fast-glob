# Contributing to my package

Welcome, and thank you for your interest in contributing to **fast-glob**!

Please note that this project is released with a [Contributor Code of Conduct](CODE-OF-CONDUCT.md). By participating in this project you agree to abide by its terms.

## Contribution Guidelines

There are a couple of ways you can contribute to this repository:

* **Ideas, feature requests and bugs**: We are open to all ideas and we want to get rid of bugs! Use the [Issues section](https://github.com/mrmlnc/fast-glob/issues) to either report a new issue, provide your ideas or contribute to existing threads.
* **Documentation**: Found a typo or strangely worded sentences? Submit a PR!
* **Code**: Contribute bug fixes, features or design changes.

### Creating an Issue

Before you create a new Issue:

* Check the [Issues](https://github.com/mrmlnc/fast-glob/issues) on GitHub to ensure one doesn't already exist.
* Clearly describe the issue, including the steps to reproduce the issue.

### Making Changes

#### Getting Started

* Install [Node.js](https://nodejs.org/en/).
* Fork the project and clone the fork repository. ([how to create fork?](https://help.github.com/articles/fork-a-repo/#fork-an-example-repository)).
* Create a topic branch from the master branch.
* Run `npm install` to install the application dependencies.

#### Setup

> 📖 Only `npm` is supported for working with this repository. Problems with other package managers will be ignored.

```bash
# Clone repository
git clone https://github.com/mrmlnc/fast-glob
cd fast-glob

# Install dependencies
npm install

# Build package
npm run build

# Run tests
npm t
npm run test:e2e

# Watch changes
npm run watch

# Run benchmark
npm run bench:async
npm run bench:sync
npm run bench:stream
```

#### Commit

Keep git commit messages clear and appropriate. You can use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
