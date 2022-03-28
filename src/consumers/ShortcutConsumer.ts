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

    const promises = groupStoriesResponse.data.map((item: any, storyIndex: number) => {
      const delayOffset = (storyIndex + 1) * SHORT_SLEEP_TIME_TO_AVOID_SPAMMING_SOURCE_API_MS;
      return sleep(delayOffset)
        .then(() => axios.get(`https://api.app.shortcut.com/api/v3/stories/${item.id}`, { headers: { 'Shortcut-Token': `${process.env.CONSUMER_TOKEN}` } }));
    });
    const stories : any[] = (await Promise.all(promises))
      .map((storyResponse: any) => storyResponse.data);

    return {
      stories,
      group: groupResponse.data,
      members: members.data,
    };
  }
}
