export interface TransferItemType {
  id: string
  countDown: number
  isReSend: boolean // 是否已经重发过
  peerId: string
  event: string
  data:any
}
