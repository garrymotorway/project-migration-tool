import { ShortcutMapper } from '@/mappers/ShortcutMapper';
import Mapper from '@mappers/Mapper';
import { SHORTCUT, JIRA } from '@enums/ProjectManagementSystems';
import JIRAMapper from './JIRAMapper';

function getSourceMapper(sourceName: string): (data: any) => any {
  if (sourceName.toLowerCase() === SHORTCUT.toLowerCase()) {
    return ShortcutMapper.from;
  }
  throw new Error(`Could not create a mapper with source ${sourceName}.`);
}

function getDestMapper(destName: string): (data: any) => any {
  if (destName.toLowerCase() === JIRA.toLowerCase()) {
    return JIRAMapper.to;
  }
  throw new Error(`Could not create a mapper with destination ${destName}.`);
}

export default class MapperFactory {
  static create(sourceName: string, destName: string): Mapper<any, any> {
    return {
      from: getSourceMapper(sourceName),
      to: getDestMapper(destName),
    };
  }
}
