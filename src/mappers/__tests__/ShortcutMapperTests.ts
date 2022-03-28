import ShortcutMapper from '@mappers/ShortcutMapper';
const shortcutGetStoryData = require('./data/shortcut-get-story.json');
const shortcutGroupData = require('./data/shortcut-group.json');
const shortcutMemberData = require('./data/shortcut-members.json');

const data: any = {
  stories: [shortcutGetStoryData],
  group: shortcutGroupData,
  members: shortcutMemberData,
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

test('Maps story reporter', () => {
  expect(mappedData.stories[0].reporter).toEqual(data.members[0].profile.name);
});

test('Maps story type', () => {
  expect(mappedData.stories[0].type).toEqual('chore');
});

test('Maps story title', () => {
  expect(mappedData.stories[0].title).toEqual(data.stories[0].name);
});

test('Maps story description', () => {
  expect(mappedData.stories[0].description).toEqual(data.stories[0].description);
});

test('Maps status', () => {
  expect(mappedData.stories[0].status).toEqual(123);
});

test('Maps story comments', () => {
  expect(mappedData.stories[0].comments).not.toBeUndefined();
  expect(mappedData.stories[0].comments).toHaveLength(1);
  expect(mappedData.stories[0].comments[0].body).toEqual(data.stories[0].comments[0].text);
  expect(mappedData.stories[0].comments[0].author).toEqual('Joe Bloggs');
  expect(mappedData.stories[0].comments[0].created).toEqual(data.stories[0].comments[0].created_at);
});
