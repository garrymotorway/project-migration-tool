const { JIRA } = require("../enums/ProjectManagementSystems");
import JIRAProducer from "./JIRAProducer";
import Producer from "./Producer";

module.exports = {
    create: (producerName: string) : Producer => {
        switch(producerName?.toLowerCase()) {
            case JIRA:
                return new JIRAProducer();
            default:
                throw new Error(`The producer ${producerName} is not valid.`);
        }
    }
}