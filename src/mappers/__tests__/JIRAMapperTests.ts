import JIRAMapper from '@mappers/JIRAMapper';
import { CommonStoryModel } from '@mappers/CommonModels';

const data: CommonStoryModel = {
  stories: [{
    externalId: '123',
    status: 'Has been mergeD',
    title: 'Some title',
    description: 'A description with a [link](http://google.com) with screenshot ![Screenshot 2022-03-21 at 14.25.43.png](https://media.app.shortcut.com/api/attachments/files/clubhouse-assets/file.png).',
    comments: [
      {
        body: '[@huwrose](shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be6) hello and you [@john](shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be7) how are you. Also [@johnSmith](shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be8)',
        author: 'Luke Skywalker',
        created: '2022-03-22T09:19:57Z',
      },
    ],
    updated: '2022-03-22T09:19:57Z',
    created: '2022-03-21T09:19:57Z',
    reporter: 'John Smith',
    type: 'chore',
    estimate: 5,
    labels: ['mvp'],
    tasks: [{
      id: 1234,
      complete: false,
      created: '2022-03-21T09:19:57Z',
      updated: '2022-03-21T09:19:57Z',
      reporter: 'John Doe',
      description: 'This is a task',
    }],
    epicId: '78393',
  }],
  project: {
    name: 'Project Name',
    description: 'Project description with a [link](http://google.com).',
  },
  epics: [
    {
      id: '78393',
      name: 'my epic',
      author: 'Jane Doe',
      created: '2022-03-21T12:39:57Z',
      updated: '2022-03-21T12:39:57Z',
      status: 'to do',
    },
  ],
};

const mappedData: any = JIRAMapper.to(data);

const epic: any = mappedData.projects[0].issues[0];
const story: any = mappedData.projects[0].issues[1];
const task: any = mappedData.projects[0].issues[2];
const link: any = mappedData.links[0];

test('Maps project external ID', () => {
  expect(mappedData.projects[0].id).toEqual(process.env.PRODUCER_BOARD_ID);
});

test('Maps project key', () => {
  expect(mappedData.projects[0].key).toEqual(process.env.PRODUCER_BOARD_ID);
});

test('Maps project name', () => {
  expect(mappedData.projects[0].name).toEqual(data.project.name);
});

test('Maps project description', () => {
  expect(mappedData.projects[0].description).toEqual('Project description with a [link|http://google.com].');
});

test('Maps story title to issue title', () => {
  expect(story.summary).toEqual(data.stories[0].title);
});

test('Maps story estimate', () => {
  expect(story.customFieldValues[0].value).toEqual(data.stories[0].estimate);
});

test('Maps story labels', () => {
  expect(story.labels).toBeDefined();
  expect(story.labels).toHaveLength(1);
  expect(story.labels[0]).toEqual(data.stories[0].labels[0]);
});

test('Maps story description to issue description', () => {
  expect(story.description).toEqual('A description with a [link|http://google.com] with screenshot [Screenshot 2022-03-21 at 14.25.43.png|https://media.app.shortcut.com/api/attachments/files/clubhouse-assets/file.png].');
});

test('Maps story external ID to issue external ID', () => {
  expect(story.externalId).toEqual(data.stories[0].externalId);
});

test('Maps story reporter', () => {
  expect(story.reporter).toEqual(data.stories[0].reporter);
});

test('Maps story status', () => {
  expect(story.status).toEqual('MERGED');
});

test('Maps story points', () => {
  const customFieldValue: any = story.customFieldValues.find((item: any) => item.fieldName === 'Story Points');
  expect(customFieldValue).toBeDefined();
  expect(customFieldValue.fieldName).toEqual('Story Points');
  expect(customFieldValue.fieldType).toEqual('com.atlassian.jira.plugin.system.customfieldtypes:float');
  expect(customFieldValue.value).toEqual(5);
});

test('Maps comments', () => {
  expect(story.comments).toBeDefined();
  expect(story.comments[0]).toBeDefined();
  expect(story.comments[0].body).toEqual('[@huwrose|shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be6] hello and you [@john|shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be7] how are you. Also [@johnSmith|shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be8]');
  expect(story.comments[0].author).toEqual(data.stories[0].comments[0].author);
  expect(story.comments[0].created).toEqual(data.stories[0].comments[0].created);
});

test('Maps tasks and creates the links to parent story', () => {
  expect(task).toBeDefined();
  expect(task.status).toEqual('Open');
  expect(task.reporter).toEqual(data.stories[0].tasks[0].reporter);
  expect(task.summary).toEqual(data.stories[0].tasks[0].description);
  expect(task.issueType).toEqual('Sub-task');
  expect(task.created).toEqual(data.stories[0].tasks[0].created);
  expect(task.updated).toEqual(data.stories[0].tasks[0].updated);
  expect(task.externalId).toEqual(data.stories[0].tasks[0].id);

  expect(link).toBeDefined();
  expect(link.name).toEqual(data.stories[0].tasks[0].description);
  expect(link.sourceId).toEqual(data.stories[0].tasks[0].id?.toString());
  expect(link.destinationId).toEqual(data.stories[0].externalId);
});

test('Adds epics to issues', () => {
  expect(epic).toBeDefined();
  expect(epic.status).toEqual('To Do');
  expect(epic.key).toEqual(`${process.env.PRODUCER_BOARD_ID}-1000000`);
  expect(epic.reporter).toEqual(data.epics[0].author);
  expect(epic.summary).toEqual(data.epics[0].name);
  expect(epic.issueType).toEqual('Epic');
  expect(epic.created).toEqual(data.epics[0].created);
  expect(epic.updated).toEqual(data.epics[0].updated);
  expect(epic.externalId).toEqual(data.epics[0].id);

  expect(epic.customFieldValues).toBeDefined();
  expect(epic.customFieldValues[0].fieldName).toEqual('Epic Name');
  expect(epic.customFieldValues[0].fieldType).toEqual('com.pyxis.greenhopper.jira:gh-epic-label');
  expect(epic.customFieldValues[0].value).toEqual(data.epics[0].name);
});

test('Links epic to story', () => {
  const customFieldValue: any = story.customFieldValues.find((item: any) => item.fieldName === 'Epic Link');
  expect(customFieldValue).toBeDefined();
  expect(customFieldValue.fieldName).toEqual('Epic Link');
  expect(customFieldValue.fieldType).toEqual('com.pyxis.greenhopper.jira:gh-epic-link');
  expect(customFieldValue.value).toEqual(`${process.env.PRODUCER_BOARD_ID}-1000000`);
});

test('Maps story type', () => {
  expect(mappedData.projects[0].issues[1].issueType).toEqual('Task');
});
