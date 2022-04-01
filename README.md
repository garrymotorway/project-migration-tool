# project-migration-tool

## Motivation

This is a project (WIP) to take stories from Shortcut and move them into JIRA using the respective APIs.

## Pre-reqs

* Must have a target project setup in JIRA
* Must have a board setup in JIRA (the ID in the url is the rapid view ID). In JIRA this is achieved as follows (if it doesn't exist already)
  * Board (pulldown) > Create Board > Scrum > Board from an existing project > Enter a name > Create board.
* You must map statuses in Shortcut to the desired statuses in JIRA; this is currently hard-coded in ./src/mappers/getStatusMap.ts; the Shortcut side uses a regular expression to match, so you can use wildcards etc for fuzzy matching. Every status from Shortcut must be mappable.

## To run

Currently the only way to run it is to import into this library into a new project and run with the node CLI. Example below (this is 
excluded by .gitignore)

in this example add this code to index.js

```javascript
const PMT = require("../project-migration-tool");

process.env.CONSUMER_TOKEN = 'abc'; // An API key created on the source side (e.g. Shortcut)
process.env.PRODUCER_TOKEN = 'def'; // An API key created on the destination side (e.g. JIRA)
process.env.SAMPLE = 10; // Optional - can be used to try a sample first. Will get all data if omitted.
process.env.DEFAULT_REPORTER = 'garry@motorway.co.uk'; // Optional - if reporter doesn't exist in JIRA this will be used (set it to the go-to person in your team for backlog refinement, e.g. Agile lead). If this isn't specified the account of the person doing the import is used by JIRA
process.env.DEST_SEED=1000000 // This assists with preventing ID clashing in existing projects. Make it higher than the highest issue number in your existing project (which could just be 0 for a fresh project).

(async function () {
  await PMT.default(require('./config.json'));
}());
```

The config provides all the information needed to map from a source to a destination. An example is this

```
{
    "source": {
        "name": "shortcut",
        "projectId": "abddsd343782ihds7c"
    },
    "destination": {
        "name": "jira",
        "projectId": "HOT",
        "boardId": 7
    },
    "statusMap": {
        "Archived": "Closed",
        "Backlog": "To Do",
        "Ready for Development": "To Do",
        "Blocked": "BLOCKED",
        "In Development": "In Progress",
        "Code Review": "PEER REVIEW",
        ".*QA.*": "TESTING",
        ".*Merged.*": "MERGED",
        ".*Shipped.*": "SHIPPED",
        "Ready to Start": "To Do",
        "To do": "To Do",
        "In Progress": "In Progress",
        "Peer Review": "PEER REVIEW",
        "Testing": "TESTING",
        "Done": "Closed",
        ".*Design phase.*": "In Progress"
    },
    "issueTypeMap": {
        "chore": "Task",
        "bug": "Bug",
        "feature": "Story"
    }
}
```

* `source` Contains name of the data source and the projectId
* `destination` Contains the name of the destination and the projectId and a boardId (if applicable, e.g. in JIRA)
* `statusMap` a mapping of statuses from the source to the destination (in JIRA workflow must be setup in advance)
* `issueTypeMap` if the destination system supports multiple types of issue, this allows you to map the issue type from the source to an issue type in the destination (example shows Shortcut => JIRA)

Currently supported source/destinations are
* jira
* shortcut

From a terminal window run like this

```sh
node index.js > ./output.json
```

Then output.json can be uploaded to JIRA [here](https://motorway.atlassian.net/secure/admin/ExternalImport1.jspa).

## Design overview

* Consumers read data from a source system.
* Producers write data to a destination system.
* Mappers map data consumed from a source system into a common (generic) format, this generic structure is then given to the producer to format in a way the destination system can understand.
* Orchestrator handles everything; consuming, mapping and producing.

## ToDos

* Lots of hardcoded hacks and workarounds (done to get the tool working) that need to be refined to make this tool more generic.
* Tests don't cover a lot of edge cases.
* Would be nice to have client wrappers around the API calls.
* Need typescript types for JIRA.
* Few linting issues.
* Could setup a build to run tests etc.
