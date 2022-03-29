import axios from 'axios';
import Consumer from '@consumers/Consumer';
import ShortcutConsumer from '@consumers/ShortcutConsumer';

jest.mock('axios');
(axios.get as unknown as jest.Mock).mockImplementation(async (url: string) => {
  if (url === `https://api.app.shortcut.com/api/v3/groups/${process.env.CONSUMER_BOARD_ID}/stories`) {
    return { data: [{ id: 1 }, { id: 2 }, { id: 3 }] };
  }

  if (url === `https://api.app.shortcut.com/api/v3/groups/${process.env.CONSUMER_BOARD_ID}`) {
    return {
      data: {
        name: 'Hot wheels',
      },
    };
  }

  if (url === 'https://api.app.shortcut.com/api/v3/members') {
    return {
      data: [
        {
          profile: {
            name: 'Joe Bloggs',
          },
        },
        {
          profile: {
            name: 'John Doe',
          },
        },
      ],
    };
  }

  if (url === 'https://api.app.shortcut.com/api/v3/workflows') {
    return {
      data: [{
        id: 1000,
        states: [
          {
            id: 50000000,
            name: 'ToDo',
          },
        ],
      }],
    };
  }

  if (url === 'https://api.app.shortcut.com/api/v3/epics') {
    return {
      data: [
        { id: 4000, name: 'Epic1' },
      ],
    };
  }

  if (/https:\/\/api.app.shortcut.com\/api\/v3\/stories/i.test(url)) {
    return { data: { id: url.slice(url.length - 1) } };
  }
  throw new Error(`No mock for URL ${url}`);
});

const consumer: Consumer = new ShortcutConsumer();

test('gets a list of stories from Shortcut', async () => {
  const dataFromShortcut = await consumer.consume();
  expect(dataFromShortcut.stories).toBeDefined();
  expect(dataFromShortcut.stories.length).toEqual(3);
  expect(dataFromShortcut.stories[0].id).toEqual('1');
  expect(dataFromShortcut.stories[1].id).toEqual('2');
  expect(dataFromShortcut.stories[2].id).toEqual('3');
});

test('gets group data from Shortcut', async () => {
  const dataFromShortcut = await consumer.consume();
  expect(dataFromShortcut.group).toBeDefined();
  expect(dataFromShortcut.group.name).toEqual('Hot wheels');
});

test('gets members from Shortcut', async () => {
  const dataFromShortcut = await consumer.consume();
  expect(dataFromShortcut.members).toBeDefined();
  expect(dataFromShortcut.members.length).toEqual(2);
  expect(dataFromShortcut.members[0].profile.name).toEqual('Joe Bloggs');
  expect(dataFromShortcut.members[1].profile.name).toEqual('John Doe');
});

test('gets workflows from Shortcut', async () => {
  const dataFromShortcut = await consumer.consume();
  expect(dataFromShortcut.workflows).toBeDefined();
  expect(dataFromShortcut.workflows).toHaveLength(1);
  expect(dataFromShortcut.workflows[0].states).toBeDefined();
  expect(dataFromShortcut.workflows[0].states).toHaveLength(1);
  expect(dataFromShortcut.workflows[0].states[0].name).toEqual('ToDo');
  expect(dataFromShortcut.workflows[0].states[0].id).toEqual(50000000);
});

test('gets epics from Shortcut', async () => {
  const dataFromShortcut = await consumer.consume();
  expect(dataFromShortcut.epics).toBeDefined();
  expect(dataFromShortcut.epics.length).toEqual(1);
});
