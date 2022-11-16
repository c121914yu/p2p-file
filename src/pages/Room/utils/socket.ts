/* 与服务器socket链接 */
import { io, Socket } from 'socket.io-client'
import { ServerToClientEvents, ClientToServerEvents } from '@/types'
import { socketCallbackEnum } from '@/constants'

export type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>

interface Props {
  connectedCb: (socket:SocketLink) => void
}

export class SocketLink {
  private socket: SocketType

  // eslint-disable-next-line no-unused-vars, func-call-spacing
  private callbackMap = new Map<string, (data: any) => void>()

  constructor({ connectedCb }: Props) {
    this.socket = io(import.meta.env.VITE_SOCKET_IO, {
      path: import.meta.env.VITE_SOCKET_PATH,
      transports: ['polling', 'websocket'],
    })
    this.socket.on('connect', () => {
      connectedCb(this)
      console.log('socket连接成功')
    })

    this.socket.on('connect_error', e => {
      console.log('socket连接失败', e)
    })

    this.socket.on('p2p-file', ({ type, data }) => {
      if (this.callbackMap.has(type)) {
        // @ts-ignore-nextLine
        this.callbackMap.get(type)(data)
      }
    })
  }

  disconnect() {
    this.socket.disconnect()
    console.log('socket断开')
  }

  /**
   * 注册回调函数
   */
  registerCallback(key:`${ socketCallbackEnum }`, cb:(data: any) => void) {
    this.callbackMap.set(key, cb)
  }

  unregisterCallback(key:`${ socketCallbackEnum }`) {
    this.callbackMap.delete(key)
  }

  /**
   * 加入房间
   */
  joinRoom(peerId:string, roomId:string) {
    this.socket.emit('join-room', {
      peerId,
      roomId
    })
  }
}
