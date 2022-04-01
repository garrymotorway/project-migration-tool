import MapperFactory from '@mappers/MapperFactory';
import { ShortcutMapper } from '@mappers/ShortcutMapper';
import JIRAMapper from '@mappers/JIRAMapper';
import { CommonModel } from '@/models/CommonModels';

const config = require('../../__tests__/data/config-example.json');

jest.mock('@mappers/ShortcutMapper');
jest.mock('@mappers/JIRAMapper');

test('returns a ShortcutMapper when shortcut is the source', () => {
  MapperFactory.create(config).sourceMapper.from({} as CommonModel);
  expect(ShortcutMapper.prototype.from).toBeCalled();
});

test('returns a JIRA mapper when JIRA is the destination', async () => {
  await MapperFactory.create(config).destinationMapper.to({} as CommonModel);
  expect(JIRAMapper.prototype.to).toBeCalled();
});
