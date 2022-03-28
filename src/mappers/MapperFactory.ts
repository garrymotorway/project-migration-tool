import ShortcutToJIRAMapper from '@mappers/ShortcutToJIRAMapper';
import Mapper from '@mappers/Mapper';
import { SHORTCUT, JIRA } from '@enums/ProjectManagementSystems';

export default class MapperFactory {
  static create(sourceName: string, destName: string): Mapper<any, any> {
    if (`${sourceName}:${destName}`.toLowerCase() === `${SHORTCUT}:${JIRA}`.toLowerCase()) {
      return new ShortcutToJIRAMapper();
    }
    throw new Error(`Could not create a ${sourceName} to ${destName} mapper.`);
  }
}
