import { midjourneyWs } from "../src/index";

// @ts-ignore
import WebSocket from 'ws';

(global as any).WebSocket = WebSocket;
async function main() {
    const ws = new midjourneyWs("ws://chatgpt-ws.dev.xxjio.com/ws");
    ws.on("message", (message: any) => {
        console.log(message);
    });

}
main().then(() => {}).catch((e) => {console.log(e)});