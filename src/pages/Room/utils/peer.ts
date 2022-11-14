interface Props {
  openedCb: (id:string) => void
}
export class PeerLink {
  private peer: any

  private otherPeers = new Map<string, boolean>()

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
    this.peer.on('connect', (conn:any) => {
      console.log(`新的连接`, conn)
    })
  }

  disconnect() {
    this.peer.destroy()
    console.log('节点销毁')
  }

  getPeerId() {
    return this.peer.id
  }

  connectPeer(id:string) {
    if (this.otherPeers.get(id)) return
    this.otherPeers.set(id, true)
    this.peer.connect(id)
  }
}

