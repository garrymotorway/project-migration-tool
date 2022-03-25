import Orchestrator from "../Orchestrator"
const { SHORTCUT, JIRA } = require("../enums/ProjectManagementSystems");
import Consumer from "../consumers/Consumer";
import Mapper from "../mappers/Mapper";
const ConsumerFactory = require("../consumers/ConsumerFactory");
const ProducerFactory = require("../producers/ProducerFactory");
const MapperFactory = require("../mappers/MapperFactory");

describe("OrchestratorTests", () => {
    // let orchestrator: Orchestrator;
    // let consumeMock: () => any;
    // let produceMock: () => void;
    // let mapMock: () => Mapper<any, any>;

    // beforeEach(() => {
    //     consumeMock = jest.fn()
    //     produceMock = jest.fn();
    //     mapMock = jest.fn();

    //     jest.mock("../consumers/ConsumerFactory");
    //     jest.mock("../consumers/ConsumerFactory");
    //     jest.spyOn(MapperFactory, "create").mockImplementation(() => { map: () => 1 });
    //     jest.spyOn(ConsumerFactory, "create").mockImplementation(() => { consume: () => 1 });
    //     jest.spyOn(ProducerFactory, "create").mockImplementation(() => { produce: () => 1 });
    //     orchestrator = new Orchestrator(SHORTCUT, JIRA);        
    // })

    // it("run -> consumes data from the source system", () => {
    //     orchestrator.run();
    //     expect(consumeMock).toHaveBeenCalled();
    // });

    // it("run -> maps data from the source system to a format understood by the destination system", () => {
    //     orchestrator.run();
    //     expect(mapMock).toHaveBeenCalled();
    // });

    // it("run -> produces data to the destination system", () => {
    //     orchestrator.run();
    //     expect(produceMock).toHaveBeenCalled();
    // });

    it("dummy", () => {
    });
});