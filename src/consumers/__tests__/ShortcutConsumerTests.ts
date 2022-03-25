import axios from "axios";
import Consumer from "../Consumer";
import ShortcutConsumer from "../ShortcutConsumer";

jest.mock("axios" )

describe("ShortcutConsumerTests", () => {
    let consumer: Consumer;

    beforeEach(() => consumer = new ShortcutConsumer());

    it("gets a list of stories from Shortcut", async () => {
        axios.get = jest.fn().mockResolvedValue({ data: [] });
        expect(await consumer.consume()).not.toBeUndefined();
    });

    it("gets each story's details from Shortcut", () => {

    });

    it("Returns a list of stories from Shortcut", () => {

    });
});