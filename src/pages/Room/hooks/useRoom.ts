import { useRef, useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { UserType, FileType } from '@/types'
import { peerCallbackEnum, FILE_STATUS } from '@/constants'
import { $warning } from '@/utils'
import { SocketLink } from '../utils/socket'
import { PeerLink } from '../utils/peer'
import { useFiles } from './useFile'

export function useRoom() {
  const { id: roomId } = useParams()
  const socket = useRef<SocketLink>()
  const peer = useRef<PeerLink>()
  const [linking, setLinking] = useState(false)
  const [refresh, setFresh] = useState(0)

  const {
    roomFiles,
    setRoomFiles,
    addFiles,
    downloadFile,
    updateFileStatus,
    delDisconnectedFiles
  } = useFiles()

  /**
   * 新节点加入，建立连接(自己加入也会触发)
   */
  const newJoinRoom = useCallback((users:UserType[]) => {
    if (!peer.current) return
    const otherUser = users.filter(user => user.peerId !== peer.current?.getPeerId())

    console.log('加入了房间, 目前房间人:', users)
    // p2p连接其他用户
    otherUser.forEach(user => {
      setLinking(true)
      /* 连接另一个节点。并在连接成功后，触发一次添加文件事件，把自己有的文件发过去 */
      peer.current?.connectPeer(user.peerId, () => {
        setRoomFiles(files => {
          peer.current?.sendDataToPeer(
            user.peerId,
            peerCallbackEnum.addFiles,
            files.filter(file => file.peerId === peer.current?.getPeerId())
              .map(file => {
                return {
                  ...file,
                  raw: null
                }
              })
          )
          return files
        })
      })
    })
  }, [setRoomFiles])

  /**
   * 用户离开，删除离开用户的缓存
   */
  const userLeaveRoom = useCallback((users:UserType[]) => {
    if (!peer.current) return
    console.log('有人离开了房间, 目前房间人:', users)
    peer.current.closeSomeConnection(users)
    delDisconnectedFiles(peer.current?.getPeerId(), peer.current?.getOtherConnections())
  }, [delDisconnectedFiles])

  /**
   * 请求下载回调（收到请求下载）
   * 把文件流发给对应的节点
   */
  const reqDownloadCallback = useCallback((peerId:string, file: FileType) => {
    setRoomFiles(files => {
      const bufferFile = files.find(item => item.id === file.id)

      const sendRes = peer.current?.sendDataToPeer(peerId, peerCallbackEnum.resDownload, bufferFile)

      if (sendRes) {
        updateFileStatus(file.id, FILE_STATUS.sending)
      }
      return files
    })
  }, [setRoomFiles, updateFileStatus])

  /**
   * 响应文件下载（接收文件流）
   * 文件流转成文件下载
   */
  const resDownloadCallback = useCallback((peerId: string, file: FileType) => {
    console.log('收到下载数据', peerId, file)
    // 记录缓存
    setRoomFiles(files => files.map(item => item.id === file.id ? file : item))
    // 下载该文件
    downloadFile(file)
    // 更新该文件的状态
    updateFileStatus(file.id, FILE_STATUS.leisure)
    // 通知对方，下载完成
    peer.current?.sendDataToPeer(peerId, peerCallbackEnum.downloadFinish, {
      ...file,
      raw: null
    })
  }, [downloadFile, setRoomFiles, updateFileStatus])

  /**
   * 下载完成回调
   */
  const downLoadFinishCallback = useCallback((peerId: string, file: FileType) => {
    console.log('对方下载已完成', peerId, file)
    updateFileStatus(file.id, FILE_STATUS.leisure)
  }, [updateFileStatus])

  /**
   * 下载错误
   * 所有文件变成error态
   */
  const downloadErrorCallback = useCallback(() => {
    roomFiles.forEach(file => {
      updateFileStatus(file.id, FILE_STATUS.error)
    })
  }, [roomFiles, updateFileStatus])

  const initSocket = useCallback(() => new Promise<SocketLink>(resolve => {
    socket.current = new SocketLink({
      connectedCb: (socket) => {
        // 注册回调
        socket.registerCallback('new-join', newJoinRoom)
        socket.registerCallback('leave-room', userLeaveRoom)
        resolve(socket)
      }
    })
  }), [newJoinRoom, userLeaveRoom])

  const initPeer = useCallback(() => new Promise<string>(resolve => {
    peer.current = new PeerLink({
      openedCb: (id:string) => {
        resolve(id)
      }
    })
    peer.current.registerCallback(peerCallbackEnum.addFiles, addFiles)
    peer.current.registerCallback(peerCallbackEnum.reqDownload, reqDownloadCallback)
    peer.current.registerCallback(peerCallbackEnum.resDownload, resDownloadCallback)
    peer.current.registerCallback(peerCallbackEnum.downloadError, downloadErrorCallback)
    peer.current.registerCallback(peerCallbackEnum.downloadFinish, downLoadFinishCallback)
    peer.current.registerCallback(peerCallbackEnum.linkFinish, () => setLinking(false)) // peer连接完成
  }), [addFiles, downLoadFinishCallback, downloadErrorCallback, reqDownloadCallback, resDownloadCallback])

  /**
   * 加入房间，直接发送对应的socket信息
   */
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

    setFresh(state => state + 1)
  }

  /**
   * 点击下载文件
   * 向对应文件的作者，发出下载请求。
   */
  const onclickDownloadFile = useCallback((file:FileType) => {
    // 自己的文件，不要下载
    if (file.peerId === peer.current?.getPeerId()) return
    // 下载中，不能进行
    if (file.status === FILE_STATUS.sending) return

    if (file.raw) {
      downloadFile(file)
      return
    }
    const sendRes = peer.current?.sendDataToPeer(file.peerId, peerCallbackEnum.reqDownload, file)

    if (sendRes) { // 消息发送出去了
      updateFileStatus(file.id, FILE_STATUS.sending)
    } else { // 消息没发送出去
      $warning('该节点已经退出房间')
      delDisconnectedFiles(peer.current?.getPeerId(), peer.current?.getOtherConnections())
    }
  }, [delDisconnectedFiles, downloadFile, updateFileStatus])

  useEffect(() => {
    initRoom()
  }, [])

  useEffect(() => () => {
    socket.current?.disconnect()
  }, [socket])
  useEffect(() => () => {
    peer.current?.disconnect()
  }, [peer])

  return {
    roomFiles,
    setRoomFiles,
    linking,
    sendDataToOtherPeers: (event:string, data:any) => { peer.current?.sendDataToOtherPeers(event, data) },
    peerId: peer.current?.getPeerId(),
    peer,
    refresh,
    setFresh,
    onclickDownloadFile
  }
}
