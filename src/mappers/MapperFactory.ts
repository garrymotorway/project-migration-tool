import { ShortcutMapper } from '@/mappers/ShortcutMapper';
import { DestinationMapper, Mapper, SourceMapper } from '@mappers/Mapper';
import { SHORTCUT, JIRA } from '@enums/ProjectManagementSystems';
import { ShortcutModel } from '@/models/ShortcutModels';
import { Config } from '@/models/Config';
import JIRAMapper from './JIRAMapper';

function getSourceMapper(config: Config): SourceMapper<ShortcutModel> {
  if (config.source.name.toLowerCase() === SHORTCUT.toLowerCase()) {
    return new ShortcutMapper();
  }
  throw new Error(`Could not create a mapper with source ${config.source.name}.`);
}

function getDestMapper(config: Config): DestinationMapper<any> {
  if (config.destination.name.toLowerCase() === JIRA.toLowerCase()) {
    return new JIRAMapper(config.statusMap, config.issueTypeMap, config.destination.projectId, config.destination.boardId);
  }
  throw new Error(`Could not create a mapper with destination ${config.destination.name}.`);
}

export default class MapperFactory {
  static create(config: Config): Mapper<any, any> {
    return {
      sourceMapper: getSourceMapper(config),
      destinationMapper: getDestMapper(config),
    };
  }
}
