import ReconnectingWebSocket from 'reconnecting-websocket'
import { ChatgptMesasge, ChatgptMesasgeWs } from "@ohdat/opb/chatgpt_pb";
export class ChatgptSocket {
  ws: ReconnectingWebSocket
  private event: Array<{ event: string; callback: (message: any) => void }> = []
  private lastPong = new Date().getTime()
  constructor(uri: string) {
    this.ws = new ReconnectingWebSocket(uri, undefined, { maxRetries: 0 })
    this.ws.binaryType = 'arraybuffer'
    this._connect()
    this.ping()
  }
  private emit(event: string, message: any) {
    this.event.forEach(val => {
      if (val.event === event) {
        val.callback && val.callback(message)
      }
    })
  }
  public on(event: string, callback: (message: any) => void) {
    this.event.push({ event, callback })
  }
  public remove(event: string, callback: (message: any) => void) {
    this.event = this.event.filter(val => {
      return val.event !== event || val.callback !== callback
    })
  }
  private ping() {
    const now = new Date().getTime()
    if (this.ws.readyState !== this.ws.OPEN || now - this.lastPong > 30000) {
      this.ws.reconnect()
      setTimeout(this.ping.bind(this), 5000)
      return
    }
    this.ws.send('ping')
    setTimeout(this.ping.bind(this), 5000)
  }

  private _connect() {
    this.ws.addEventListener('message', e => {
      if (e.data == 'pong') {
        this._handlePong()
        return
      }
      const msg = ChatgptMesasge.deserializeBinary(e.data);
      if (msg.getParentMessageId() == '') {
        this.emit('message-end', msg.getMessageId());
      }else{
        this.emit('message', msg);
      }
    })
  }

  private _handlePong() {
    this.lastPong = new Date().getTime()
  }

  private send(message: any) {
    this.ws.send(message)
  }
  public onMessage(callback: (message: ChatgptMesasge) => void) {
    this.on('message', callback)
  }
  public onMessageEnd(callback: (messageId: string) => void) {
    this.on('message-end', callback)
  }

  public reply(message:string,conversationId:string,parentMessageId:string){
    const msg = new ChatgptMesasge();
    msg.setMessage(message);
    msg.setConversationId(conversationId);
    msg.setParentMessageId(parentMessageId);
    this.ws.send(msg.serializeBinary());
  }
}
