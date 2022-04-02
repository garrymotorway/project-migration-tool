import './module-alias-config';
import { Config } from '@models/Config';
import Orchestrator from './Orchestrator';

export default async function run(config: Config) {
  if (!config.source.projectId) {
    throw new Error('You didn\'t set a value for source.projectId; this is a guid in Shortcut for the group');
  }

  if (!config.destination.projectId) {
    throw new Error('You didn\'t set a value for destination.projectId; this is usually a few characters in JIRA, e.g. \'HOT\'');
  }

  if (!process.env.CONSUMER_TOKEN) {
    throw new Error('You need to provide a value for the environment variable CONSUMER_TOKEN so the tool can connect to the source system');
  }

  if (!process.env.PRODUCER_TOKEN) {
    throw new Error('You need to provide a value for the environment variable PRODUCER_TOKEN so the tool can connect to the destination system');
  }

  await new Orchestrator(config).run();
}
