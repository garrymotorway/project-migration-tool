import Orchestrator from "../Orchestrator"

const { SHORTCUT, JIRA } = require("../enums/ProjectManagementSystems");

const consume = jest.fn(() => 1);
const produce = jest.fn();
const map = jest.fn(() => 1);

jest.mock("../consumers/ConsumerFactory", () => ({ create: () => ({ consume }) }));
jest.mock("../mappers/MapperFactory", () => ({ create: () => ({ map }) }));
jest.mock("../producers/ProducerFactory", () => ({ create: () => ({ produce }) }));

describe("OrchestratorTests", () => {
    let orchestrator: Orchestrator;

    beforeEach(() => orchestrator = new Orchestrator(SHORTCUT, JIRA));

    it("run -> consumes data from the source system", () => {
        orchestrator.run();
        expect(consume).toHaveBeenCalled();
    });

    it("run -> maps data from the source system to a format understood by the destination system", () => {
        orchestrator.run();
        expect(map).toHaveBeenCalled();
    });

    it("run -> produces data to the destination system", () => {
        orchestrator.run();
        expect(produce).toHaveBeenCalled();
    });
});