export enum peerCallbackEnum {
  openedPeer = 'opened-peer', // 个人节点打开
  iDisconnected = 'i-disconnected', // 我的节点断开连接
  iClosed = 'i-closed', // 我的节点销毁了
  aPeerDisconnected = 'a-peer-disconnect', // 一个节点断开了连接
  aPeerClose = 'a-peer-close', // 一个节点关闭了
  linkPeer = 'link-peer', // 连接某个节点
  otherOpened = 'other-opened', // 连接的节点已经打开
  connections = 'connections', // 收到对方已经连接的节点
  transferCb = 'transfer-callback', // 分段传输回调
  peerError = 'connect-error', // 节点之间发生错误错误
  connectionError = 'connection-error', // 连接之间发生错误
  transferError = 'transfer-error', // 传输错误
}
