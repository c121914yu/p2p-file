import { callbackEnum } from '@/constants'
export interface UserType {
  clientId: string
  roomId: string
  peerId: string
}

interface ServerToClientEventsParams {
  type: `${ callbackEnum }`
  [data: string]: any
}

export interface ServerToClientEvents {
  'p2p-file': (data:ServerToClientEventsParams) => void;
}

export interface ClientToServerEvents {
  'join-room': any;
}
