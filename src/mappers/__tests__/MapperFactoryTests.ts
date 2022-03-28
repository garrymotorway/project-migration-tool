import MapperFactory from '@mappers/MapperFactory';
import ShortcutToJIRAMapper from '@mappers/ShortcutToJIRAMapper';

import { SHORTCUT, JIRA } from '@enums/ProjectManagementSystems';

describe('MapperFactoryTests', () => {
  it('returns a ShortcutToJIRAMapper', () => expect(MapperFactory.create(SHORTCUT, JIRA)).toBeInstanceOf(ShortcutToJIRAMapper));
});
