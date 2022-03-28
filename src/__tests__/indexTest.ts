import Orchestrator from '@/Orchestrator';
import run from '@/index';

jest.mock('@/Orchestrator');

describe('Index Tests', () => {
  it('test test', () => {
    run('src', 'dest');
    expect(Orchestrator.prototype.run).toBeCalledTimes(1);
  });
});
