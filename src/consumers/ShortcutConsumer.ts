import Consumer from './Consumer';

const axios = require('axios');

const sleep = require('await-sleep');

const SHORT_SLEEP_TIME_TO_AVOID_SPAMMING_SOURCE_API_MS = 50;

export default class ShortcutConsumer implements Consumer {
  async consume() {
    const res = await axios.get(`https://api.app.shortcut.com/api/v3/groups/${process.env.CONSUMER_BOARD_ID}/stories`, {
      headers: {
        'Shortcut-Token': `${process.env.CONSUMER_TOKEN}`,
      },
    });

    console.log('Got a list of stories... now processing them...');
    const results = [];
    for (let i = 0; i < res.data.length; i++) {
      const item = res.data[i];
      const resItem = await axios.get(`https://api.app.shortcut.com/api/v3/stories/${item.id}`, {
        headers: {
          'Shortcut-Token': `${process.env.CONSUMER_TOKEN}`,
        },
      });
      results.push(resItem);
      // console.log(JSON.stringify(resItem.data, null, 2));
      await sleep(SHORT_SLEEP_TIME_TO_AVOID_SPAMMING_SOURCE_API_MS);
    }
    return results;
  }
}
