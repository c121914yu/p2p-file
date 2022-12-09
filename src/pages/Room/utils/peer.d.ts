export interface SendDataType { // 发送消息的入参
  id: string
  peerId: string
  event: string
  data: any
}

export interface TransferQueueItemType extends SendDataType { // 队列中数据体
  countDown: number
  isReSend: boolean // 是否已经重发过
}

export interface PushTransferItemParams { // 生成消息参数
  peerId: string
  event:string
  priority?: boolean // 是否优先
  data?:any
}
