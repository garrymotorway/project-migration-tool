const MapperFactory =  require("../MapperFactory");
import ShortcutToJIRAMapper from "../ShortcutToJIRAMapper";
const { SHORTCUT, JIRA } = require("../../enums/ProjectManagementSystems");

describe("MapperFactoryTests", () => {
    it("returns a ShortcutToJIRAMapper", () => expect(MapperFactory.create(SHORTCUT, JIRA)).toBeInstanceOf(ShortcutToJIRAMapper))
});