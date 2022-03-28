import ProducerFactory from '@producers/ProducerFactory';
import JIRAProducer from '@producers/JIRAProducer';

import { JIRA } from '@enums/ProjectManagementSystems';

test('returns a JIRAProducer', () => expect(ProducerFactory.create(JIRA)).toBeInstanceOf(JIRAProducer));
