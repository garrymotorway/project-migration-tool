import Orchestrator from '@/Orchestrator';

const { SHORTCUT, JIRA } = require('@enums/ProjectManagementSystems');

const consume = jest.fn(() => 1);
const produce = jest.fn();
const from = jest.fn(() => 1);
const to = jest.fn(() => 1);

jest.mock('@consumers/ConsumerFactory', () => ({ create: () => ({ consume }) }));
jest.mock('@mappers/MapperFactory', () => ({ create: () => ({ sourceMapper: { from }, destinationMapper: { to } }) }));
jest.mock('@producers/ProducerFactory', () => ({ create: () => ({ produce }) }));

const orchestrator: Orchestrator = new Orchestrator({
  source: SHORTCUT,
  destination: JIRA,
  statusMap: { '.*': 'ToDo' },
  issueTypeMap: { '.*': 'Task' },
});

test('run -> consumes data from the source system', () => {
  orchestrator.run();
  expect(consume).toHaveBeenCalled();
});

test('run -> maps data from the source system', async () => {
  await orchestrator.run();
  expect(from).toHaveBeenCalled();
});

test('run -> maps data to a format understood by the destination system', async () => {
  await orchestrator.run();
  expect(to).toHaveBeenCalled();
});

test('run -> produces data to the destination system', async () => {
  await orchestrator.run();
  expect(produce).toHaveBeenCalled();
});
