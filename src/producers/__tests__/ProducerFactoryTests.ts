import ProducerFactory from '@producers/ProducerFactory';
import JIRAProducer from '@producers/JIRAProducer';

import { JIRA } from '@enums/ProjectManagementSystems';

describe('ProducerFactoryTests', () => {
  it('returns a JIRAProducer', () => expect(ProducerFactory.create(JIRA)).toBeInstanceOf(JIRAProducer));
});
