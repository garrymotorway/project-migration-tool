const { SHORTCUT } = require("../enums/ProjectManagementSystems");
import Consumer from "./Consumer";
import ShortcutConsumer from "./ShortcutConsumer";

module.exports = {
    create: (consumerName: string): Consumer => {
        switch(consumerName?.toLowerCase()) {
            case SHORTCUT:
                return new ShortcutConsumer();
            default:
                throw new Error(`The consumer ${consumerName} is not valid.`);
        }
    }
}