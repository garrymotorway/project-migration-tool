const ProducerFactory =  require("../ProducerFactory");
import JIRAProducer from "../JIRAProducer";
const { JIRA } = require("../../enums/ProjectManagementSystems");

describe("ProducerFactoryTests", () => {
    it("returns a JIRAProducer", () => expect(ProducerFactory.create(JIRA)).toBeInstanceOf(JIRAProducer));
});