import { UserType } from '@/types'
import { peerCallbackEnum } from '@/constants'
interface Props {
  openedCb: (id:string) => void
}
export class PeerLink {
  private peer: any

  private otherConn = new Map<string, any>()

  // eslint-disable-next-line no-unused-vars, func-call-spacing
  private callbackMap = new Map<string, (peerId:string, data: any) => void>()

  constructor({ openedCb }: Props) {
    // @ts-ignore-nextLine
    this.peer = new Peer()

    /**
     * 个人节点打开
     */
    this.peer.on('open', (id:string) => {
      openedCb(id)
      console.log('个人节点获取成功', id)
    })

    /**
     * 监听新的连接
     */
    this.peer.on('connection', (conn:any) => {
      console.log(`节点连接成功`, this.otherConn)

      /**
       * 监听对方信息
       */
      conn.on('data', (e:any) => {
        console.log('收到一条信息====', e)
        if (this.callbackMap.has(e.event)) {
          // @ts-ignore-nextLine
          this.callbackMap.get(e.event)(e.peerId, e.data)
        }
      })
    })

    /**
     * 连接失败
     */
    this.peer.on('error', (e) => {
      console.log('peer连接出错了', e)
    })

    /**
     * 有节点销毁，从缓存中删除
     */
    this.peer.on('close', () => {
      this.closeSomeConnection()
      console.log('节点销毁', this.otherConn)
    })
  }

  /**
   * 销毁节点.同时关闭所有连接
   */
  disconnect() {
    this.peer.disconnect()
    this.peer.destroy()
  }

  /**
   * 关闭部分连接节点
   */
  closeSomeConnection() {
    // 查看目前缓存里的节点。
    for (const key of this.otherConn.keys()) {
      // 如果缓存的节点，在已连接的节点中找不到，说明对方已经断开，则从缓存中删除
      const connItem = this.peer.connections[ key ]

      if (!connItem || connItem.length > 0) {
        this.otherConn.get(key).close()
        this.otherConn.delete(key)
      }
    }
    console.log('有节点断开连接', this.peer.connections)
  }

  getPeerId():string {
    return this.peer.id
  }

  connectPeer(peerId:string, openCb:() => void) {
    if (this.otherConn.has(peerId)) return
    console.log('开始连接节点:', peerId)
    const conn = this.peer.connect(peerId)

    this.otherConn.set(peerId, conn)

    conn.on('open', () => {
      openCb()
      // 连接完成
      if (this.callbackMap.has(peerCallbackEnum.linkFinish)) {
        // @ts-ignore-nextLine
        this.callbackMap.get(peerCallbackEnum.linkFinish)()
      }
      console.log('节点已打开，可以发送消息了===')
    })
    conn.on('error', (e) => {
      console.log('点对点通信出错===', e)
    })
  }

  /**
   * 注册回调函数
   */
  registerCallback(key:`${ peerCallbackEnum }`, cb:(peerId:string, data: any) => void) {
    this.callbackMap.set(key, cb)
  }

  unregisterCallback(key:`${ peerCallbackEnum }`) {
    this.callbackMap.delete(key)
  }

  /**
   * 向其他节点发送信息
   */
  sendDataToOtherPeers(event: string, data:any) {
    this.otherConn.forEach((conn:any, peerId:string) => {
      this.sendDataToPeer(peerId, event, data)
    })
  }

  /**
   * 向某个节点发送消息
   */
  sendDataToPeer(peerId:string, event:string, data:any) {
    if (this.otherConn.has(peerId)) {
      console.log('发送消息===', peerId, event, data)

      this.otherConn.get(peerId).send({
        event,
        peerId: this.peer.id,
        data
      })
    }
  }
}

