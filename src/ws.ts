import ReconnectingWebSocket from 'reconnecting-websocket'
import { MessageRequestV2, MessageEvent } from '@ohdat/pb/lib/message/message'
export class WebSocketV2 {
  ws: ReconnectingWebSocket
  private event: Array<{ event: string; callback: (message: any) => void }> = []
  private lastPong = new Date().getTime()
  constructor(uri: string) {
    this.ws = new ReconnectingWebSocket(uri, undefined, { maxRetries: 0 })
    this.ws.binaryType = 'arraybuffer'
    this._connect()
    this.ping()
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
      const msg = MessageRequestV2.decode(new Uint8Array(e.data))
      switch (msg.event) {
        case MessageEvent.PushMessage:
          this._handleMessage(msg.message)
          break
        case MessageEvent.SpeakerPush:
          this.emit('speaker', msg.message)
          break
        case MessageEvent.SwitchMusic:
          this.emit('switchMusic', msg.message)
          break
        case MessageEvent.SwitchParty:
          this.emit('switchParty', msg.message)
          break
        case MessageEvent.Like:
          this.emit('like', msg.message)
          break
        case MessageEvent.Login:
          this.emit('login', msg.message)
          break
        case MessageEvent.Solitaire:
          this.emit('solitaire', msg.message)
          break
        case MessageEvent.OnlineNum:
          this.emit('onlineNum', msg.message)
          break
        case MessageEvent.ChangeVolume:
          this.emit('changeVolume', msg.message)
          break
        case MessageEvent.AvatarAction:
          this.emit('avatarAction', msg.message)
          break
        case MessageEvent.PlayerAction:
          this.emit('playerAction', msg.message)
          break
        case MessageEvent.PlayerMove:
          this.emit('playerMove', msg.message)
          break
        case MessageEvent.ShowerGifts:
          this.emit('showerGifts', msg.message)
          break
        case MessageEvent.CapsRain:
          this.emit('capsRain', msg.message)
          break
        case MessageEvent.RankingList:
          this.emit('RankingList', msg.message)
          break
      }
    })
  }
  private _handleMessage(message: any) {
    this.emit('message', JSON.parse(message))
  }
  private _handlePong() {
    this.lastPong = new Date().getTime()
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
  public send(message: any) {
    this.ws.send(message)
  }

  // functional say hi
  public sendPlayerAction(uid: any, message: any) {
    let mgsReqV2: MessageRequestV2 = {
      event: MessageEvent.PlayerAction,
      message: JSON.stringify({ uid, message }),
    }
    const msg = MessageRequestV2.encode(mgsReqV2).finish()
    this.ws.send(msg)
  }

  // message {uid:?,x:?,y:?}
  public sendPlayerMove(uid: number, message: any) {
    let mgsReqV2: MessageRequestV2 = {
      event: MessageEvent.PlayerMove,
      message: message,
    }
    const msg = MessageRequestV2.encode(mgsReqV2).finish()
    this.ws.send(msg)
  }

  public onMessage(callback: (message: any) => void) {
    this.on('message', callback)
  }
  public onSpeaker(callback: (message: any) => void) {
    this.on('speaker', callback)
  }
  public onSwitchMusic(callback: (message: any) => void) {
    this.on('switchMusic', callback)
  }
  public onSwitchParty(callback: (message: any) => void) {
    this.on('switchParty', callback)
  }
  public onLike(callback: (message: any) => void) {
    this.on('like', callback)
  }
  public onLogin(callback: (message: any) => void) {
    this.on('login', callback)
  }
  public onSolitaire(callback: (message: any) => void) {
    this.on('solitaire', callback)
  }
  public onOnlineNum(callback: (message: any) => void) {
    this.on('onlineNum', callback)
  }
  public onChangeVolume(callback: (message: any) => void) {
    this.on('changeVolume', callback)
  }
  public onAvatarAction(callback: (message: any) => void) {
    this.on('avatarAction', callback)
  }
  public onPlayerAction(callback: (message: any) => void) {
    this.on('playerAction', callback)
  }
  public onPlayerMove(callback: (message: any) => void) {
    this.on('playerMove', callback)
  }
  public onShowerGifts(callback: (message: any) => void) {
    this.on('showerGifts', callback)
  }
  public onCapsRain(callback: (message: any) => void) {
    this.on('capsRain', callback)
  }
  public onRankingList(callback: (message: any) => void) {
    this.on('rankingList', callback)
  }
}
