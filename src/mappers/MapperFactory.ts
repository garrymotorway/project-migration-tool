import ShortcutToJIRAMapper from "../mappers/ShortcutToJIRAMapper";
import Mapper from "./Mapper";
const { SHORTCUT, JIRA } = require("../enums/ProjectManagementSystems");

module.exports = {
    create: (sourceName: string, destName: string): Mapper<any, any> => {
        if(`${sourceName}:${destName}`.toLowerCase()  === `${SHORTCUT}:${JIRA}`.toLowerCase()) {
            return new ShortcutToJIRAMapper();
        }
        throw new Error(`Could not create a ${sourceName} to ${destName} mapper.`)
    }
}