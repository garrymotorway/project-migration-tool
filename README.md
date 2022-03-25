# project-migration-tool

## Motivation

This is a project (WIP) to take stories from Shortcut and move them into JIRA using the respective APIs.

## To run

Currently the only way to run it is to create ./src/run-test.js, and include keys etc. Example below (this is excluded by .gitignore)

```typescript
import Orchestrator from "./Orchestrator";

process.env.CONSUMER_TOKEN = "******";
process.env.PRODUCER_TOKEN = "clientid:secret";
process.env.CONSUMER_BOARD_ID = "<boardid>";

(function() {
    new Orchestrator("shortcut", "jira").run();
})();
```

```sh
npm run start
```