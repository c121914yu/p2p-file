export interface TransferItemType {
  id: string
  countDown: number
  isReSend: boolean // 是否已经重发过
  peerId: string
  event: string
  data:any
}

export interface TransferParams {
  peerId: string
  event:string
  data?:any
  priority?: boolean
}

export interface TransferData {
  id: string
  countDown: number
  isReSend: boolean
  peerId: string
  event: string
  data: any
}
