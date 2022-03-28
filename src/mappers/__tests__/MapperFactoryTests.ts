import MapperFactory from '@mappers/MapperFactory';
import ShortcutMapper from '@mappers/ShortcutMapper';
import JIRAMapper from '@mappers/JIRAMapper';

import { SHORTCUT, JIRA } from '@enums/ProjectManagementSystems';

jest.mock('@mappers/ShortcutMapper');
jest.mock('@mappers/JIRAMapper');

test('returns a ShortcutMapper when shortcut is the source', () => {
  MapperFactory.create(SHORTCUT, JIRA).from({});
  expect(ShortcutMapper.from).toBeCalled();
});

test('returns a JIRA mapper when JIRA is the destination', () => {
  MapperFactory.create(SHORTCUT, JIRA).to({});
  expect(JIRAMapper.to).toBeCalled();
});
