import { ShortcutMapper, getStateNameFromId } from '@mappers/ShortcutMapper';

const shortcutGetStoryData = require('./data/shortcut-get-story.json');
const shortcutGroupData = require('./data/shortcut-group.json');
const shortcutMemberData = require('./data/shortcut-members.json');
const workflowData = require('./data/workflow-data.json');

const data: any = {
  stories: [shortcutGetStoryData],
  group: shortcutGroupData,
  members: shortcutMemberData,
  workflows: workflowData,
};

const mappedData = ShortcutMapper.from(data);

test('Maps project name', () => {
  expect(mappedData.project.name).toEqual(data.group.name);
});

test('Maps project description', () => {
  expect(mappedData.project.description).toEqual(data.group.description);
});

test('Maps story external Id', () => {
  expect(mappedData.stories[0].externalId).toEqual(data.stories[0].id);
});

test('Maps story updated at timestamp', () => {
  expect(mappedData.stories[0].updated).toEqual(data.stories[0].updated_at);
});

test('Maps story created at timestamp', () => {
  expect(mappedData.stories[0].created).toEqual(data.stories[0].created_at);
});

test('Maps story created at timestamp', () => {
  expect(mappedData.stories[0].estimate).toEqual(data.stories[0].estimate);
});

test('Maps story reporter', () => {
  expect(mappedData.stories[0].reporter).toEqual(data.members[0].profile.email_address);
});

test('Maps story labels', () => {
  expect(mappedData.stories[0].labels).toHaveLength(1);
  expect(mappedData.stories[0].labels[0]).toEqual('mvp');
});

test('Maps story type', () => {
  expect(mappedData.stories[0].type).toEqual('chore');
});

test('Maps story title', () => {
  expect(mappedData.stories[0].title).toEqual(data.stories[0].name);
});

test('Maps story description', () => {
  expect(mappedData.stories[0].description).toEqual('this is a description of my story for @garry with screenshot ![Screenshot 2022-03-21 at 14.25.43.png](https://media.app.shortcut.com/api/attachments/files/clubhouse-assets/file.png).');
});

test('Maps status', () => {
  expect(mappedData.stories[0].status).toEqual('Ready for Development');
});

test('Uses status Id if status cannot be mapped', () => {
  expect(getStateNameFromId([{
    id: 1000,
    states: [
      { id: 5001, name: 'Dont use this' },
    ],
  }], 1000, 5002)).toEqual(5002);
});

test('Maps story comments', () => {
  expect(mappedData.stories[0].comments).not.toBeUndefined();
  expect(mappedData.stories[0].comments).toHaveLength(1);
  expect(mappedData.stories[0].comments[0].body).toEqual('foo @john take a look');
  expect(mappedData.stories[0].comments[0].author).toEqual(data.members[1].profile.email_address);
  expect(mappedData.stories[0].comments[0].created).toEqual(data.stories[0].comments[0].created_at);
});

test('Maps story tasks', () => {
  expect(mappedData.stories[0].tasks).not.toBeUndefined();
  expect(mappedData.stories[0].tasks).toHaveLength(1);
  expect(mappedData.stories[0].tasks[0].id).toEqual(data.stories[0].tasks[0].id);
  expect(mappedData.stories[0].tasks[0].complete).toEqual(data.stories[0].tasks[0].complete);
  expect(mappedData.stories[0].tasks[0].created).toEqual(data.stories[0].tasks[0].created_at);
  expect(mappedData.stories[0].tasks[0].updated).toEqual(data.stories[0].tasks[0].updated_at);
  expect(mappedData.stories[0].tasks[0].reporter).toEqual(data.stories[0].tasks[0].reporter);
  expect(mappedData.stories[0].tasks[0].description).toEqual(data.stories[0].tasks[0].description);
});
