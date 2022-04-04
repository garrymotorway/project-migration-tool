import ProducerFactory from '@producers/ProducerFactory';
import JIRAProducer from '@producers/JIRAProducer';

import { JIRA } from '@enums/ProjectManagementSystems';

test('returns a JIRAProducer', () => expect(ProducerFactory.create({ name: JIRA, projectId: 'ABC', boardId: 456 })).toBeInstanceOf(JIRAProducer));
