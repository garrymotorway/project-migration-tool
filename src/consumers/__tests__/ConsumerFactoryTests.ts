import ConsumerFactory from '@consumers/ConsumerFactory';
import ShortcutConsumer from '@consumers/ShortcutConsumer';

const { SHORTCUT } = require('@enums/ProjectManagementSystems');

test('returns a ShortcutConsumer', () => expect(ConsumerFactory.create(SHORTCUT)).toBeInstanceOf(ShortcutConsumer));
