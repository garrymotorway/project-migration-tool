import ConsumerFactory from '@consumers/ConsumerFactory';
import ShortcutConsumer from '@consumers/ShortcutConsumer';

const { SHORTCUT } = require('@enums/ProjectManagementSystems');

test('returns a ShortcutConsumer', () => expect(ConsumerFactory.create({
  name: SHORTCUT, projectId: 'sdwe2123', batchSize: 2, maxResults: 1000,
})).toBeInstanceOf(ShortcutConsumer));
