import { peerCallbackEnum } from '@/constants'
interface Props {
  myPeerId?: string
  openedCb: (peer:PeerLink) => void
}
export class PeerLink {
  private peer: any

  // eslint-disable-next-line no-unused-vars, func-call-spacing
  private callbackMap = new Map<string, ((peerId:string, data: any) => void)[]>()

  constructor({
    myPeerId,
    openedCb
  }: Props) {
    // @ts-ignore-nextLine
    this.peer = new Peer(myPeerId)

    // 事件注册
    // 接收到一个节点发来的其连接节点信息，也去连接这些节点
    this.registerCallback(peerCallbackEnum.connections, (peerId: string, peers: string[]) => {
      peers.forEach(peer => this.connectPeer(peer))
    })
    // 监听到有一个节点关闭，关闭和它的连接
    this.registerCallback(peerCallbackEnum.peerDisconnect, (peerId:string) => {
      this.getSendDataPeerConn(peerId).close()
    })

    /**
     * 个人节点打开
     */
    this.peer.on('open', (id:string) => {
      console.log('个人节点获取成功', id)
      openedCb(this)
    })

    /**
     * 监听新的连接进入
     * @param {Any} conn 对方连我的实例
     */
    this.peer.on('connection', (conn:any) => {
      console.log(`有新的节点连入`)

      /* 判断下这个节点，我是否已经和他连接了 */
      if (!this.peerIsConnected(conn.peer)) {
        this.connectPeer(conn.peer)
      }

      /**
       * 监听对方信息
       */
      conn.on('data', (e:any) => {
        console.log('收到一条信息====', e)
        this.runCallback(e.event, e.peerId, e.data)
      })
    })

    /**
     * 连接失败
     */
    this.peer.on('error', (e) => {
      console.log('peer连接出错了', e)
    })

    /**
     * 本节点断开连接
     */
    this.peer.on('disconnected', () => {
      console.log('我断开连接了')
    })

    /**
     * 本节点关闭
     */
    this.peer.on('close', () => {
      console.log('我自己销毁了')
    })
  }

  /**
   * 销毁节点.同时关闭所有连接
   */
  iDestroy() {
    this.sendDataToOtherPeers(peerCallbackEnum.peerDisconnect)
    setTimeout(() => {
      this.peer.destroy()
    }, 100)
  }

  getPeerId():string {
    return this.peer.id
  }

  /**
   * 判断某个节点是否还连接
   */
  peerIsConnected(peerId:string) {
    const connItem = this.peer.connections[ peerId ]

    return connItem && connItem.find(conn => !conn.options?.connectionId)
  }

  getConnections() {
    const res = {}

    for (const peerId in this.peer.connections) {
      if (this.peerIsConnected(peerId)) {
        res[ peerId ] = this.peer.connections[ peerId ]
      }
    }
    return res
  }

  /**
   * 获取发送消息的conn
   */
  getSendDataPeerConn(peerId: string) {
    return this.getConnections()[ peerId ].find(conn => !conn.options?.connectionId)
  }

  /**
   * 开始连接节点
   * @param {string} peerId 需要连接的节点
   */
  connectPeer(peerId:string) {
    if (this.peerIsConnected(peerId)) return
    console.log('开始连接节点:', peerId)

    // conn为我连接对方的节点
    const conn = this.peer.connect(peerId, {
      reliable: true
    })

    conn.on('open', () => {
      console.log('对方节点已打开，可以发送消息了===', this.getConnections())
      this.runCallback(peerCallbackEnum.otherOpened, peerId)
      // 告诉对方，我连接的其他节点
      const peers:string[] = []

      for (const id in this.getConnections()) {
        // 不是打开的节点，且连接正常的其他节点
        if (id !== peerId && this.peerIsConnected(id)) {
          peers.push(id)
        }
      }
      peers.length > 0 && this.sendDataToPeer(peerId, peerCallbackEnum.connections, peers)
    })
    conn.on('error', (e) => {
      this.runCallback(peerCallbackEnum.downloadError)
      console.log('点对点通信出错===', e)
    })
    conn.on('close', () => {
      console.log(peerId, '关闭了', this.peer.connections)
    })
  }

  /**
   * 注册回调函数
   */
  registerCallback(key:`${ peerCallbackEnum }`, cb:(peerId:string, data: any) => void) {
    if (!this.callbackMap.has(key)) {
      this.callbackMap.set(key, [])
    }
    this.callbackMap.get(key)?.push(cb)
  }

  unregisterCallback(key:`${ peerCallbackEnum }`) {
    this.callbackMap.delete(key)
  }

  /**
   * 执行回调
   */
  runCallback(key:`${ peerCallbackEnum }`, peerId?:string, data?:any) {
    if (this.callbackMap.has(key)) {
      // @ts-ignore-nextLine
      this.callbackMap.get(key)?.forEach(cb => cb(peerId, data))
    }
  }

  /**
   * 向所有连接的节点发送信息
   */
  sendDataToOtherPeers(event: string, data?:any) {
    for (const peerId in this.getConnections()) {
      this.sendDataToPeer(peerId, event, data)
    }
  }

  /**
   * 向某个节点发送消息
   */
  sendDataToPeer(peerId:string, event:string, data?:any) {
    if (this.peerIsConnected(peerId)) {
      console.log('发送消息===', peerId, event, data)
      this.getSendDataPeerConn(peerId).send({
        event,
        peerId: this.peer.id,
        data
      })
      return true
    }
    return false
  }
}

