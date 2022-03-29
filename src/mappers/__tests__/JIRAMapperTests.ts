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
  }],
  project: {
    name: 'Project Name',
    description: 'Project description with a [link](http://google.com).',
  },
};

const mappedData: any = JIRAMapper.to(data);

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
  expect(mappedData.projects[0].issues[0].summary).toEqual(data.stories[0].title);
});

test('Maps story estimate', () => {
  expect(mappedData.projects[0].issues[0].customFieldValues[0].value).toEqual(data.stories[0].estimate);
});

test('Maps story labels', () => {
  expect(mappedData.projects[0].issues[0].labels).toBeDefined();
  expect(mappedData.projects[0].issues[0].labels).toHaveLength(1);
  expect(mappedData.projects[0].issues[0].labels[0]).toEqual(data.stories[0].labels[0]);
});

test('Maps story description to issue description', () => {
  expect(mappedData.projects[0].issues[0].description).toEqual('A description with a [link|http://google.com] with screenshot [Screenshot 2022-03-21 at 14.25.43.png|https://media.app.shortcut.com/api/attachments/files/clubhouse-assets/file.png].');
});

test('Maps story external ID to issue external ID', () => {
  expect(mappedData.projects[0].issues[0].externalId).toEqual(data.stories[0].externalId);
});

test('Maps story reporter', () => {
  expect(mappedData.projects[0].issues[0].reporter).toEqual(data.stories[0].reporter);
});

test('Maps story status', () => {
  expect(mappedData.projects[0].issues[0].status).toEqual('MERGED');
});

test('Maps comments', () => {
  expect(mappedData.projects[0].issues[0].comments).toBeDefined();
  expect(mappedData.projects[0].issues[0].comments[0]).toBeDefined();
  expect(mappedData.projects[0].issues[0].comments[0].body).toEqual('[@huwrose|shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be6] hello and you [@john|shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be7] how are you. Also [@johnSmith|shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be8]');
  expect(mappedData.projects[0].issues[0].comments[0].author).toEqual(data.stories[0].comments[0].author);
  expect(mappedData.projects[0].issues[0].comments[0].created).toEqual(data.stories[0].comments[0].created);
});

test('Maps tasks and creates the links to parent story', () => {
  expect(mappedData.projects[0].issues[1]).toBeDefined();
  expect(mappedData.projects[0].issues[1].status).toEqual('Open');
  expect(mappedData.projects[0].issues[1].reporter).toEqual(data.stories[0].tasks[0].reporter);
  expect(mappedData.projects[0].issues[1].summary).toEqual(data.stories[0].tasks[0].description);
  expect(mappedData.projects[0].issues[1].issueType).toEqual('Sub-task');
  expect(mappedData.projects[0].issues[1].created).toEqual(data.stories[0].tasks[0].created);
  expect(mappedData.projects[0].issues[1].updated).toEqual(data.stories[0].tasks[0].updated);
  expect(mappedData.projects[0].issues[1].externalId).toEqual(data.stories[0].tasks[0].id);

  expect(mappedData.links).toHaveLength(1);
  expect(mappedData.links[0]).toBeDefined();
  expect(mappedData.links[0].name).toEqual(data.stories[0].tasks[0].description);
  expect(mappedData.links[0].sourceId).toEqual(data.stories[0].tasks[0].id?.toString());
  expect(mappedData.links[0].destinationId).toEqual(data.stories[0].externalId);
});

test('Maps story type', () => {
  expect(mappedData.projects[0].issues[0].issueType).toEqual('Task');
});
