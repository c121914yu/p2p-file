import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { UserType } from '@/types'
import { SocketLink, SocketType } from '../utils/socket'
import { PeerLink } from '../utils/peer'

export function useRoom() {
  const { id: roomId } = useParams()
  const [socket, setSocket] = useState<SocketLink>()
  const [peer, setPeer] = useState<PeerLink>()
  const [init, setInit] = useState(false)

  const newJoinRoom = (users:UserType[]) => {
    console.log(peer)

    if (!peer) return
    const otherUser = users.filter(user => user.peerId !== peer.getPeerId())

    // p2p连接其他用户
    console.log('加入了房间', otherUser)
  }
  const userLeaveRoom = useCallback((users:UserType[]) => {
    // const otherUser = users.filter(user => user.clientId !== clientId)

    console.log('离开了房间')
  }, [])

  const initSocket = useCallback(() => new Promise<SocketLink>(resolve => {
    setSocket(new SocketLink({
      connectedCb: (socket) => {
        // 注册回调
        socket.registerCallback('new-join', newJoinRoom)
        socket.registerCallback('leave-room', userLeaveRoom)
        resolve(socket)
      }
    }))
  }), [])

  const initPeer = useCallback(() => new Promise<string>(resolve => {
    setPeer(new PeerLink({
      openedCb: (id:string) => {
        resolve(id)
      }
    }))
  }), [])

  const joinRoom = useCallback((socketItem:SocketLink, peerId:string) => {
    roomId && socketItem.joinRoom(peerId, roomId)
  }, [roomId])

  const initRoom = async() => {
    // socket链接
    const socketItem = await initSocket()
    // 初始化本机peer
    const peerId = await initPeer()

    // 加入房间
    joinRoom(socketItem, peerId)

    // setInit(true)
  }

  useEffect(() => {
    console.log(111111111111)
    initRoom()
  }, [])

  useEffect(() => () => {
    socket?.disconnect()
  }, [socket])
  useEffect(() => () => {
    peer?.disconnect()
  }, [peer])

  return {
    init
  }
}
