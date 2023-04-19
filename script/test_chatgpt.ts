import { ChatgptSocket } from "../src/index";
import { ChatgptMesasge } from "@ohdat/opb/chatgpt_pb";

// @ts-ignore
import WebSocket from 'ws';
async function timeout(ms: number) {
return new Promise((resolve) => setTimeout(resolve, ms));
}
(global as any).WebSocket = WebSocket;
async function main() {
    // const ws = new ChatgptSocket("ws://127.0.0.1:8080/connect");
    const ws = new ChatgptSocket("ws://chatgpt-ws.dev.xxjio.com/connect");
    let parentMessageId:string ="" ,conversationId:string="";
    ws.on("message", (message: ChatgptMesasge) => {
        console.log(message.toObject());
        parentMessageId = message.getParentMessageId();
        conversationId = message.getConversationId();
    });
    await timeout(3000);
    if (conversationId && parentMessageId ) {
        ws.reply("我随便回复一个",conversationId,parentMessageId);
    }
    // console.log("send");
    // ws.reply("你好","","");
    // console.log("sendxxx");
    await timeout(10000000);
}
main().catch((e) => {console.log(e)});