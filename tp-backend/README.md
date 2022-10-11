# tp-backend
This repository contains the backend for the Truck Parking frontend. The backend is responsible for communicating between
the server and the frontend.

## How to start developing
1. Clone the repository
2. Run `npm install`
3. Start developing

Running `npm install` will set up git hooks to lint files before each commit. Git hooks are implemented using
[lint-staged](https://github.com/okonet/lint-staged) and [husky](https://github.com/typicode/husky). Running
`git commit` will try to fix linting issues by re-formatting files. If eslint wasn't able to fix some errors, the commit
will fail. In such case the errors will be shown to the developer.
