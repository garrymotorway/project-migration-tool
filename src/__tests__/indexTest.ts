import Orchestrator from '../Orchestrator';
import run from '../index';

jest.mock('./Orchestrator');

const config = require('./data/config-example.json');

test('test test', () => {
  run(config);
  expect(Orchestrator.prototype.run).toBeCalledTimes(1);
});
