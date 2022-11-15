import { socketCallbackEnum } from '@/constants'
export interface UserType {
  clientId: string
  roomId: string
  peerId: string
}

interface ServerToClientEventsParams {
  type: `${ socketCallbackEnum }`
  [data: string]: any
}

export interface ServerToClientEvents {
  'p2p-file': (data:ServerToClientEventsParams) => void;
}

export interface ClientToServerEvents {
  'join-room': any;
}
