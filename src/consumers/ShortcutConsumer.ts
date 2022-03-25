import axios from "axios";
import Consumer from "./Consumer";
const sleep = require("await-sleep");

export default class ShortcutConsumer implements Consumer {
    async consume() {
        const res = await axios.get(`https://api.app.shortcut.com/api/v3/groups/${process.env.CONSUMER_BOARD_ID}/stories`, { headers: {
            "Shortcut-Token": process.env.CONSUMER_TOKEN + ""
        } });

        console.log("Got a list of stories... now processing them...")

        for(let i = 0; i <res.data.length; i++) {
            const item = res.data[i];
            const resItem = await axios.get(`https://api.app.shortcut.com/api/v3/stories/${item.id}`, { headers: {
                "Shortcut-Token": process.env.CONSUMER_TOKEN + ""
            } });
            console.log(JSON.stringify(resItem.data, null, 2));

            await sleep(2000);
        }
    }
}
