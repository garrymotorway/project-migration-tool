import Consumer from '@consumers/Consumer';

const axios = require('axios');

const sleep = require('await-sleep');

const SHORT_SLEEP_TIME_TO_AVOID_SPAMMING_SOURCE_API_MS = 50;

export default class ShortcutConsumer implements Consumer {
  async consume(): Promise<any> {
    const groupStoriesResponse = await axios.get(`https://api.app.shortcut.com/api/v3/groups/${process.env.CONSUMER_BOARD_ID}/stories`, {
      headers: {
        'Shortcut-Token': `${process.env.CONSUMER_TOKEN}`,
      },
    });

    const groupResponse = await axios.get(`https://api.app.shortcut.com/api/v3/groups/${process.env.CONSUMER_BOARD_ID}`, {
      headers: {
        'Shortcut-Token': `${process.env.CONSUMER_TOKEN}`,
      },
    });

    const members = await axios.get('https://api.app.shortcut.com/api/v3/members', {
      headers: {
        'Shortcut-Token': `${process.env.CONSUMER_TOKEN}`,
      },
    });
    const groupStoriesPromises = groupStoriesResponse.data.slice(0, 10).map((item: any, storyIndex: number) => {
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
      group: groupResponse.data,
      members: members.data,
      workflows: workflows.data,
    };
  }
}
