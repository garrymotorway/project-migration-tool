import JIRAMapper from '@mappers/JIRAMapper';
import { CommonStoryModel } from '@mappers/CommonModels';

const data: CommonStoryModel = {
  stories: [{
    externalId: '123',
    status: 'Has been mergeD',
    title: 'Some title',
    description: 'A description',
    comments: [
      {
        body: 'hello',
        author: 'Luke Skywalker',
        created: '2022-03-22T09:19:57Z',
      },
    ],
    updated: '2022-03-22T09:19:57Z',
    created: '2022-03-21T09:19:57Z',
    reporter: 'John Smith',
    type: 'chore',
  }],
  project: {
    name: 'Project Name',
    description: 'Project description',
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
  expect(mappedData.projects[0].description).toEqual(data.project.description);
});

test('Maps story title to issue title', () => {
  expect(mappedData.projects[0].issues[0].summary).toEqual(data.stories[0].title);
});

test('Maps story description to issue description', () => {
  expect(mappedData.projects[0].issues[0].description).toEqual(data.stories[0].description);
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
  expect(mappedData.projects[0].issues[0].comments).not.toBeUndefined();
  expect(mappedData.projects[0].issues[0].comments).toHaveLength(1);
  expect(mappedData.projects[0].issues[0].comments[0].body).toEqual(data.stories[0].comments[0].body);
  expect(mappedData.projects[0].issues[0].comments[0].author).toEqual(data.stories[0].comments[0].author);
  expect(mappedData.projects[0].issues[0].comments[0].created).toEqual(data.stories[0].comments[0].created);
});

test('Maps story type', () => {
  expect(mappedData.projects[0].issues[0].issueType).toEqual('Task');
});
