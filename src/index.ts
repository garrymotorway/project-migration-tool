import 'module-alias/register';

import Orchestrator from '@/Orchestrator';

export default async function run(source: string, dest: string) {
  if (!process.env.PRODUCER_BOARD_RAPID_VIEW_ID || Number.isNaN(parseInt(process.env.PRODUCER_BOARD_RAPID_VIEW_ID, 10))) {
    throw new Error('You didn\'t set a value for the environment variable PRODUCER_BOARD_RAPID_VIEW_ID. This is the numeric ID of the sprint board you setup in JIRA and should be visible in the URL');
  }

  if (!process.env.CONSUMER_BOARD_ID) {
    throw new Error('You didn\'t set a value for the environment variable CONSUMER_BOARD_ID; this is a guid in Shortcut for the group');
  }

  if (!process.env.PRODUCER_BOARD_ID) {
    throw new Error('You didn\'t set a value for the environment variable PRODUCER_BOARD_ID; this is usually a few characters in JIRA, e.g. \'HOT\'');
  }

  if (!process.env.CONSUMER_TOKEN) {
    throw new Error('You need to provide a value for the environment variable CONSUMER_TOKEN so the tool can connect to the source system');
  }

  if (!process.env.PRODUCER_TOKEN) {
    throw new Error('You need to provide a value for the environment variable PRODUCER_TOKEN so the tool can connect to the destination system');
  }

  await new Orchestrator(source, dest).run();
}
