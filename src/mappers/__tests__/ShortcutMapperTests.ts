import {
  ShortcutMapper, getStateNameFromId, mapComments, getTaskCompleted,
} from '@mappers/ShortcutMapper';

const shortcutGetStoryData = require('./data/shortcut-get-story.json');
const shortcutGroupData = require('./data/shortcut-group.json');
const shortcutMemberData = require('./data/shortcut-members.json');
const workflowData = require('./data/workflow-data.json');
const epicData = require('./data/epic-data.json');
const sprintData = require('./data/sprint-data.json');
const projectsData = require('./data/shortcut-projects.json');

const data: any = {
  stories: [shortcutGetStoryData],
  group: shortcutGroupData,
  members: shortcutMemberData,
  workflows: workflowData,
  epics: epicData,
  sprints: sprintData,
  projects: projectsData,
};

let mappedData: any;

beforeEach(async () => {
  mappedData = await new ShortcutMapper().from(data);
});

test('Maps project name', () => {
  expect(mappedData.project.name).toEqual(data.group.name);
});

test('Maps project description', () => {
  expect(mappedData.project.description).toEqual(data.group.description);
});

test('Maps project components', () => {
  expect(mappedData.project.components).toEqual(['Android Seller', 'iPhone Seller', 'Blackberry Seller']);
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

test('Maps story status', () => {
  expect(mappedData.stories[0].status).toEqual('Ready for Development');
});

test('Maps story components', () => {
  expect(mappedData.stories[0].components).toEqual(['Android Seller']);
});

test('Maps epic id', () => {
  expect(mappedData.stories[0].epicId).toEqual(6619);
});

test('Maps sprint id', () => {
  expect(mappedData.stories[0].sprintId).toEqual(24418);
});

test('Uses status Id if status cannot be mapped', () => {
  expect(getStateNameFromId([{
    id: 1000,
    states: [
      { id: 5001, name: 'Dont use this' },
    ],
  }], 1000, 5002, false, false)).toEqual(5002);
});

test('Uses \'Archived\' if story is marked as archived (overriding blocked)', () => {
  expect(getStateNameFromId([{
    id: 1000,
    states: [
      { id: 5001, name: 'Dont use this' },
    ],
  }], 1000, 5002, true, true)).toEqual('Archived');
});

test('Uses \'Blocked\' if story is marked as blocked but not archived', () => {
  expect(getStateNameFromId([{
    id: 1000,
    states: [
      { id: 5001, name: 'Dont use this' },
    ],
  }], 1000, 5002, true, false)).toEqual('Blocked');
});

test('Maps story comments', () => {
  expect(mappedData.stories[0].comments).not.toBeUndefined();
  expect(mappedData.stories[0].comments).toHaveLength(1);
  expect(mappedData.stories[0].comments[0].body).toEqual('foo @john take a look');
  expect(mappedData.stories[0].comments[0].author).toEqual(data.members[1].profile.email_address);
  expect(mappedData.stories[0].comments[0].created).toEqual(data.stories[0].comments[0].created_at);
});

test('Do not map comments with missing or empty body', () => {
  expect(mapComments([{
    author_id: 'John Smith',
    created_at: '2020-01-01',
  }], [])).toHaveLength(0);
});

test('Maps story tasks', () => {
  expect(mappedData.stories[0].tasks).not.toBeUndefined();
  expect(mappedData.stories[0].tasks).toHaveLength(1);
  expect(mappedData.stories[0].tasks[0].id).toEqual(data.stories[0].tasks[0].id);
  expect(mappedData.stories[0].tasks[0].complete).toEqual(data.stories[0].completed);
  expect(mappedData.stories[0].tasks[0].created).toEqual(data.stories[0].tasks[0].created_at);
  expect(mappedData.stories[0].tasks[0].updated).toEqual(data.stories[0].tasks[0].updated_at);
  expect(mappedData.stories[0].tasks[0].reporter).toEqual(data.stories[0].tasks[0].reporter);
  expect(mappedData.stories[0].tasks[0].name).toEqual(data.stories[0].tasks[0].description);
  expect(mappedData.stories[0].tasks[0].description).toEqual(data.stories[0].tasks[0].description);
});

test('Task is marked completed if story is completed', () => {
  expect(getTaskCompleted(false, true)).toBeTruthy();
});

test('Task is marked completed if task is completed and story is not completed', () => {
  expect(getTaskCompleted(true, false)).toBeTruthy();
});

test('Task is marked not completed if task is not completed and story is not completed', () => {
  expect(getTaskCompleted(false, false)).toBeFalsy();
});

test('Maps epic', () => {
  expect(mappedData.epics).not.toBeUndefined();
  expect(mappedData.epics).toHaveLength(1);
  expect(mappedData.epics[0].id).toEqual(data.epics[0].id);
  expect(mappedData.epics[0].name).toEqual(data.epics[0].name);
  expect(mappedData.epics[0].author).toEqual('john.doe@motorway.co.uk');
  expect(mappedData.epics[0].status).toEqual(data.epics[0].state);
  expect(mappedData.epics[0].created).toEqual(data.epics[0].created_at);
  expect(mappedData.epics[0].updated).toEqual(data.epics[0].updated_at);
  expect(mappedData.epics[0].components).toEqual(['iPhone Seller', 'Blackberry Seller']);
});

test('Maps sprints', () => {
  expect(mappedData.sprints).not.toBeUndefined();
  expect(mappedData.sprints).toHaveLength(1);
  expect(mappedData.sprints[0].id).toEqual(data.sprints[0].id);
  expect(mappedData.sprints[0].name).toEqual(data.sprints[0].name);
  expect(mappedData.sprints[0].start).toEqual(data.sprints[0].start_date);
  expect(mappedData.sprints[0].end).toEqual(data.sprints[0].end_date);
  expect(mappedData.sprints[0].completed).toEqual(true);
});
