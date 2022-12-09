import { peerCallbackEnum } from './peer.constants'
import {
  TransferQueueItemType,
  PushTransferItemParams,
  SendDataType
} from './peer.d'
import { v4 } from 'uuid'
interface Props {
  myPeerId?: string
}
export class PeerLink {
  private peer: any

  // eslint-disable-next-line no-unused-vars, func-call-spacing
  private callbackMap = new Map<string, (peerId:string, data: any) => void>()

  // 我连接的conn。key为对方节点ID，value为conn实例，不记录节点
  private connectedConn = new Map<string, any>()

  // 等待发送队列
  private transferQueue:TransferQueueItemType[] = []

  // 发送中队列
  private transferringQueue:TransferQueueItemType[] = []

  // 最近10条收到的信息的ID
  private receivedQueue: string[] = []

  // 最大发送数量
  private maxTransferNum = 3

  // 超时时间（秒）
  private timeoutVal = 30

  // 发送轮询定时器，用于检查发送状态
  private transferCheckTimer:any = null

  constructor({
    myPeerId,
  }: Props) {
    // @ts-ignore-nextLine
    this.peer = new Peer(myPeerId)

    // 事件注册
    // 接收到一个节点发来的其连接节点信息，也去连接这些节点
    this.registerCallback(peerCallbackEnum.connections, (peerId: string, peers: string[]) => {
      peers.forEach(peer => this.connectPeer(peer))
    })
    // 有一个节点关闭，关闭和它的连接
    this.registerCallback(peerCallbackEnum.aPeerClose, (peerId:string) => {
      this.closePeerConnect(peerId)
      this.runCallback(peerCallbackEnum.aPeerDisconnected, peerId)
    })
    // 分段传输回调
    this.registerCallback(peerCallbackEnum.transferCb, (peerId:string, transferId: string) => {
      this.transferCb(transferId)
    })

    this.runCallback(peerCallbackEnum.openMyPeer)

    /**
     * 个人节点打开
     */
    this.peer.on('open', (id:string) => {
      console.log('个人节点获取成功', id)
      this.runCallback(peerCallbackEnum.openedPeer, '', this)
    })

    /**
     * 监听新的连接进入
     * @param {Any} conn 对方连我的实例
     */
    this.peer.on('connection', (conn:any) => {
      console.log(`有新的节点连入`, conn.peer)

      /* 我也去连接对方。connectPeer里已经做了重复连接判断，这里不需要判断 */
      this.connectPeer(conn.peer)

      /**
       * 监听对方信息. 收到消息时触发
       */
      conn.on('data', (e:SendDataType) => {
        console.log('收到一条信息====', e)
        const noCallbackFn = [
          peerCallbackEnum.transferCb,
          peerCallbackEnum.aPeerClose
        ]

        // 告诉对方收到了。如果收到的是一条 回调成功 消息，则不需要回复
        if (noCallbackFn.indexOf(e.event as peerCallbackEnum) > -1) {
          this.sendDataToPeer({ // 这里不能用队列，因为对方不会再回调给我。
            id: v4(),
            peerId: e.peerId,
            event: peerCallbackEnum.transferCb,
            data: e.id,
          })

          // 如果是最近10条接收到的信息，说明重复接收了，不执行回调
          if (this.receivedQueue.find(id => id === e.id)) {
            return
          }
          // 记录消息，并且最多保留10条
          this.receivedQueue.push(e.id)
          this.receivedQueue = this.receivedQueue.slice(0, 10)
        }

        this.runCallback(e.event, e.peerId, e.data)
      })
    })

    /**
     * 连接失败
     */
    this.peer.on('error', (e) => {
      if (!this.peer) return
      console.log('peer连接出错了', e)
      // 检测有效节点，无效的全部close掉
      for (const conn of this.getCanSendConnections()) {
        if (!conn._open) {
          this.closePeerConnect(conn.peer)
        }
      }
      this.runCallback(peerCallbackEnum.peerError)
    })

    /**
     * 本节点断开连接
     */
    this.peer.on('disconnected', () => {
      console.log('我断开连接了')
      this.runCallback(peerCallbackEnum.iDisconnected)
    })

    /**
     * 本节点关闭
     */
    this.peer.on('close', () => {
      console.log('我自己销毁了')
      this.runCallback(peerCallbackEnum.iClosed)
    })
  }

  /**
   * 销毁节点.同时告诉其他节点，我退出了
   */
  iDestroy() {
    this.sendDataToOtherPeers({ event: peerCallbackEnum.aPeerClose })
    setTimeout(() => {
      this.destroySelf()
    }, 100)
  }

  /**
   * 销毁自身实例
   */
  destroySelf() {
    clearInterval(this.transferCheckTimer)
    this.transferCheckTimer = null

    // 删除所有的等待传输和传输中内容
    this.transferQueue = []
    this.transferringQueue = []

    this.peer.destroy()
    this.peer = null
  }

  /**
   * 获取节点的ID
   */
  getPeerId():string {
    return this.peer.id
  }

  /**
   * 获取可以发送消息的所有节点
   */
  getCanSendConnections():any[] {
    return [...this.connectedConn.values()].filter(conn => this.checkConn(conn.peer))
  }

  /**
   * 判断某个节点是否存在且可用
   */
  checkConn(peerId:string) {
    return this.connectedConn.has(peerId)
  }

  /**
   * 开始连接节点
   * @param {string} peerId 需要连接的节点
   */
  connectPeer(peerId:string) {
    if (this.checkConn(peerId)) return
    console.log('开始连接节点:', peerId)
    this.runCallback(peerCallbackEnum.linkPeer, peerId)

    // conn为我连接对方的节点
    const conn = this.peer.connect(peerId, {
      reliable: true
    })

    this.connectedConn.set(peerId, conn)

    conn.on('open', () => {
      console.log('对方节点已打开，可以发送消息了===')
      this.runCallback(peerCallbackEnum.otherOpened, peerId)

      // 告诉对方，我连接的其他节点
      const peerIds:string[] = []

      for (const conn of this.getCanSendConnections()) {
        // 不是对方自己，且连接正常的其他节点
        if (peerId !== conn.peer) {
          peerIds.push(conn.peer)
        }
      }

      peerIds.length > 0 && this.pushTransferFn({
        peerId,
        event: peerCallbackEnum.connections,
        data: peerIds,
        priority: true
      })
    })
    conn.on('error', (e) => {
      console.log('点对点通信出错===', e)
      this.closePeerConnect(peerId)
      this.runCallback(peerCallbackEnum.connectionError, peerId)
    })
    conn.on('close', () => {
      console.log(peerId, '关闭了', this.peer.connections)
    })
  }

  /**
   * 关闭和一个节点的连接
   */
  closePeerConnect(peerId:string) {
    if (!this.checkConn(peerId)) return
    this.connectedConn.get(peerId).close()
    this.connectedConn.delete(peerId)
  }

  /**
   * 注册回调函数
   */
  registerCallback(key: string, cb:(peerId:string, data: any) => void) {
    this.callbackMap.set(key, cb)
  }

  unregisterCallback(key:string) {
    this.callbackMap.delete(key)
  }

  /**
   * 执行回调
   */
  runCallback(key:string, peerId?:string, data?:any) {
    if (this.callbackMap.has(key)) {
      // @ts-ignore-nextLine
      this.callbackMap.get(key)(peerId, data)
    }
  }

  /**
   * 向某个节点发送消息
   */
  sendDataToPeer({
    id,
    peerId,
    event,
    data
  }:SendDataType) {
    if (!this.checkConn(peerId)) return false
    console.log(`发送一条消息给: ${ peerId }, 事件: ${ event }, data:`, data)
    this.connectedConn.get(peerId).send({
      id,
      event,
      peerId: this.peer.id, // 我的id
      data
    })
    return true
  }

  /**
   * 获取待发送队列
   */
  getTransferQueue() {
    return this.transferQueue
  }

  /**
   * 添加等待发送的内容
   */
  pushTransferFn({ peerId, event, data, priority = false }:PushTransferItemParams) {
    if (!this.checkConn(peerId)) return false

    const item = {
      id: v4(),
      countDown: this.timeoutVal,
      isReSend: false,
      peerId,
      event,
      data,
    }

    if (priority) { // 优先发送的，直接发出
      this.sendDataToPeer({
        id: item.id,
        event: item.event,
        data: item.data,
        peerId: item.peerId
      })
    } else {
      this.transferQueue.push(item)
      this.runTransfer()
    }
    return true
  }

  /**
   * 向所有连接的节点发送信息。会把消息推入队列
   */
  sendDataToOtherPeers({ event, data, priority = false }:Omit<PushTransferItemParams, 'peerId'>) {
    for (const conn of this.getCanSendConnections()) {
      this.pushTransferFn({
        peerId: conn.peer,
        event,
        data,
        priority
      })
    }
  }

  /**
   * 执行发送. 选择最多maxTransferNum个数据进行发送
   */
  runTransfer() {
    // 如果定时器不存在，说明没有在发送，此时需要打开发送检查定时器
    if (this.transferCheckTimer === null) {
      // 每秒检查一次发送情况
      this.transferCheckTimer = setInterval(() => this.checkTransfer(), 1000)
    }

    // 最多同时发 maxTransferNum 条内容
    for (let i = 0; i < this.maxTransferNum - this.transferringQueue.length; i++) {
      const item = this.transferQueue.shift() // 弹出第一条消息

      if (item) {
        this.transferringQueue.push(item)
        this.sendDataToPeer({
          id: item.id,
          peerId: item.peerId,
          event: item.event,
          data: item.data
        })
      }
    }
  }

  /**
   * 发送消息异常。
   */
  transferError(peerId:string) {
    console.log('发生异常，结束传输')
    clearInterval(this.transferCheckTimer)
    this.transferCheckTimer = null

    // 删除所有的等待传输和传输中内容
    this.transferQueue = []
    this.transferringQueue = []

    this.runCallback(peerCallbackEnum.transferError, peerId)
  }

  /**
   * 检查整个消息传输完成
   */
  checkAllTransferFinish() {
    if (this.transferringQueue.length === 0) {
      console.log('===消息已经全部发送===')
      clearInterval(this.transferCheckTimer)
      this.transferCheckTimer = null
    }
  }

  /**
   * 检查发送的内容是否超时
   */
  checkTransfer() {
    console.log(`检查发送，当前等待队列：${ this.transferQueue.length }, 发送中队列：${ this.transferringQueue.length }`)

    // 每个发送块的倒计时减去1
    this.transferringQueue.forEach(item => {
      item.countDown--
      if (item.countDown <= 0) {
        if (item.isReSend) { // 已经重发过，直接提示传输错误
          this.transferError(item.peerId)
          return
        } else { // 重发一次
          item.isReSend = true
          item.countDown = this.timeoutVal
          this.sendDataToPeer({
            id: item.id,
            peerId: item.peerId,
            event: item.event,
            data: item.data
          })
        }
      }
    })

    this.checkAllTransferFinish()
  }

  /**
   * 收到传输回调
   */
  transferCb(id: string) {
    // 找到对应发送的内容，从发送队列中去掉
    const index = this.transferringQueue.findIndex(item => item.id === id)

    if (index >= 0) {
      this.transferringQueue.splice(index, 1)
    }

    // 判断有没有下个需要发送的内容，有的话就去发送
    const item = this.transferQueue.shift()

    if (item) {
      this.transferringQueue.push(item)
      this.sendDataToPeer({
        id: item.id,
        peerId: item.peerId,
        event: item.event,
        data: item.data
      })
      return true
    }
    this.checkAllTransferFinish()
    return false
  }
}

