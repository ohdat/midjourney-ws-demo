import ReconnectingWebSocket from 'reconnecting-websocket'
import { MJCmd, MJSend, MJReply } from "@ohdat/opb/midjourney_pb";
import {EnlargeType, VariationType} from "./enum";
export class midjourneyWs {
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
      const msg = MJReply.deserializeBinary(e.data);
      this.emit('message', msg);
    })
  }

  private _handlePong() {
    this.lastPong = new Date().getTime()
  }

  public onMessage(callback: (message: MJReply) => void) {
    this.on('message', callback)
  }
  imagine(prompt: string) {
    const msg = new MJSend();
    msg.setCmd(MJCmd.IMAGINE);
    msg.setPrompt(prompt);
    this.ws.send(msg.serializeBinary());
  }
  enlarge(messageId: string,option: EnlargeType) {
    const msg = new MJSend();
    msg.setCmd(MJCmd.ENLARGE);
    msg.setMessageId(messageId);
    msg.setOption(option);
    this.ws.send(msg.serializeBinary());
  }
  variation(messageId: string,option: VariationType) {
    const msg = new MJSend();
    msg.setCmd(MJCmd.VARIATION);
    msg.setMessageId(messageId);
    msg.setOption(option);
    this.ws.send(msg.serializeBinary());
  }
  imgLarge(prompt: string,option: EnlargeType) {
    const msg = new MJSend();
    msg.setCmd(MJCmd.IMGLARGE);
    msg.setPrompt(prompt);
    msg.setOption(option);
    this.ws.send(msg.serializeBinary());
  }
}
