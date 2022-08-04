import Consumer from '@consumers/Consumer';
import { SourceConfig } from '@models/Config';

const axios = require('axios');

const sleep = require('await-sleep');

const SHORT_SLEEP_TIME_TO_AVOID_SPAMMING_SOURCE_API_MS = 50;
const MAX_RESULTS_DEFAULT = 100000;
const BATCH_LIMIT_DEFAULT = 1000;

async function getAllGroups() {
  return axios.get('https://api.app.shortcut.com/api/v3/groups', {
    headers: {
      'Shortcut-Token': `${process.env.CONSUMER_TOKEN}`,
    },
  });
}

async function getGroupStories(config: SourceConfig) {
  const groupStoriesResponse: { data: any[] } = { data: [] };
  const maxResults = config.maxResults || MAX_RESULTS_DEFAULT;
  const batchSize = config.batchSize || BATCH_LIMIT_DEFAULT;
  let offset = 0;
  while (offset < maxResults) {
    /* eslint-disable no-await-in-loop */
    const thisGroupStoriesResponse: { data: any[] } = await axios.get(`https://api.app.shortcut.com/api/v3/groups/${config.projectId}/stories`, {
      headers: {
        'Shortcut-Token': `${process.env.CONSUMER_TOKEN}`,
      },
      data: {
        limit: config.batchSize || batchSize,
        offset,
      },
    });
    if (!thisGroupStoriesResponse.data?.length) {
      break;
    }

    groupStoriesResponse.data.push(...thisGroupStoriesResponse.data);
    offset += batchSize;
  }
  return groupStoriesResponse;
}

export default class ShortcutConsumer implements Consumer {
  constructor(private config: SourceConfig) {}

  async consume(): Promise<any> {
    const workflowId = 500048563;
    let groups = await getAllGroups();
    groups = groups.filter((g: any) => g.workflow_ids.includes((wfid: number) => wfid === workflowId));
    const theseStoriesPromises = groups.map((group: any) => {
      const config = { ...this.config, projectId: group.id };
      return getGroupStories(config);
    });
    const groupStoriesResponse = {
      data: (await Promise.all(theseStoriesPromises)).flatMap((s: any) => s.data),
    };

    // groups.array.forEach((group) => {
    //   const config = { ...this.config, projectId: group.id };
    //   const thisGroupStoriesResponse = await getGroupStories(config);
    //   const theseStories = thisGroupStoriesResponse.data;
    //   this.groupStoriesResponse.data.push(...theseStories);
    // });

    // const groupsResponse = 
    // const groupResponse = await axios.get(`https://api.app.shortcut.com/api/v3/groups/${this.config.projectId}`, {
    //   headers: {
    //     'Shortcut-Token': `${process.env.CONSUMER_TOKEN}`,
    //   },
    // });

    const members = await axios.get('https://api.app.shortcut.com/api/v3/members', {
      headers: {
        'Shortcut-Token': `${process.env.CONSUMER_TOKEN}`,
      },
    });

    const epics = await axios.get('https://api.app.shortcut.com/api/v3/epics', {
      headers: {
        'Shortcut-Token': `${process.env.CONSUMER_TOKEN}`,
      },
    });

    const sprints = await axios.get('https://api.app.shortcut.com/api/v3/iterations', {
      headers: {
        'Shortcut-Token': `${process.env.CONSUMER_TOKEN}`,
      },
    });

    const projects = await axios.get('https://api.app.shortcut.com/api/v3/projects', {
      headers: {
        'Shortcut-Token': `${process.env.CONSUMER_TOKEN}`,
      },
    });

    const groupStoriesPromises = (process.env.SAMPLE ? groupStoriesResponse.data.slice(0, parseInt(process.env.SAMPLE, 10)) : groupStoriesResponse.data).map((item: any, storyIndex: number) => {
      const delayOffset = (storyIndex + 1) * SHORT_SLEEP_TIME_TO_AVOID_SPAMMING_SOURCE_API_MS;
      return sleep(delayOffset)
        .then(() => axios.get(`https://api.app.shortcut.com/api/v3/stories/${item.id}`, { headers: { 'Shortcut-Token': `${process.env.CONSUMER_TOKEN}` } }));
    });
    const stories : any[] = (await Promise.all(groupStoriesPromises))
      .map((storyResponse: any) => storyResponse.data);

    // ToDo: Lookup on https://api.app.shortcut.com/api/v3/workflows for states
    // Match group.workflow_state_id to workflow.id
    // Extract state id and state names
    // This can be used later to provide a mapping between named states from shortcut to named states in JIRA (rather than using IDs)
    const workflows = await axios.get('https://api.app.shortcut.com/api/v3/workflows', {
      headers: {
        'Shortcut-Token': `${process.env.CONSUMER_TOKEN}`,
      },
    });

    return {
      stories,
      groups,
      members: members.data,
      workflows: workflows.data,
      epics: epics.data,
      sprints: sprints.data,
      projects: projects.data,
    };
  }
}
