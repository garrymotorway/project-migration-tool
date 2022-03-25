const ConsumerFactory =  require("../ConsumerFactory");
import ShortcutConsumer from "../ShortcutConsumer";
const { SHORTCUT } = require("../../enums/ProjectManagementSystems");

describe("ConsumerFactoryTests", () => {
    it("returns a ShortcutConsumer", () => expect(ConsumerFactory.create(SHORTCUT)).toBeInstanceOf(ShortcutConsumer))
});