# project-migration-tool

## Motivation

This is a project (WIP) to take stories from Shortcut and move them into JIRA using the respective APIs.

## Pre-reqs

* Must have a target project setup in JIRA
* Must have a sprint board setup in JIRA (the ID in the url is the rapid view ID)

## To run

Currently the only way to run it is to import into a new project and run with the node CLI. Example below (this is 
excluded by .gitignore)

in this example add this code to index.js

```javascript
const PMT = require("../project-migration-tool/dist");

process.env.CONSUMER_TOKEN = 'abc';
process.env.PRODUCER_TOKEN = 'def';
process.env.CONSUMER_BOARD_ID = 'group-id';
process.env.PRODUCER_BOARD_ID = 'HOT';
process.env.PRODUCER_BOARD_RAPID_VIEW_ID = 7; // Board ID (in JIRA find this in the URL)
process.env.SAMPLE = 10; // Optional - can be used to try a sample first. Will get all data if omitted.
process.env.DEFAULT_REPORTER = 'garry@motorway.co.uk'; // Optional - if reporter doesn't exist in JIRA this will be used. If this isn't specified the account of the person doing the import is used by JIRA

(async function () {
  await PMT.default('shortcut', 'jira');
}());
```

From a terminal window run like this

```sh
node index.js > ./output.json
```

Then output.json can be uploaded to JIRA [here](https://motorway.atlassian.net/secure/admin/ExternalImport1.jspa).