import { useRef, useState, useEffect, useCallback } from 'react'
import { FileType, TransferType } from '@/types'
import { useNavigate } from 'react-router-dom'
import { roomPeerCallback, FILE_STATUS } from '@/constants'
import { $warning } from '@/utils'
import useRoute from '@/hooks/useRoute'
import { peerCallbackEnum } from '../utils/peer.constants'
import { PeerLink } from '../utils/peer'
import { useFiles } from './useFile'
import { fileChunkNum } from '../utils/index'

export function useRoom() {
  const { connectId, myPeerId, pathname } = useRoute()
  const navigate = useNavigate()
  const peer = useRef<PeerLink>()
  const [linkingNum, setLinkingNum] = useState(0)
  const [linkedNum, setLinkedNum] = useState(1)
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
   * 我的节点已打开
   */
  const myPeerOpened = useCallback(() => {
    // 如果存在connectId，则触发节点连接
    if (connectId) {
      peer.current?.connectPeer(connectId)
    }
  }, [connectId])

  const linkPeer = useCallback(() => {
    setLinkedNum(state => state + 1)
    setLinkingNum(state => state + 1)
  }, [])

  /**
   * 对方节点已打开
   */
  const otherOpened = useCallback((peerId:string) => {
    setLinkingNum(state => state - 1)
    navigate(`${ pathname }?myPeerId=${ myPeerId }&connectId=${ peerId || '' }`, { replace: true })
    // 向对方发送我的附件信息
    roomFiles.length > 0 && peer.current?.sendDataToPeer(
      peerId,
      roomPeerCallback.addFiles,
      roomFiles.filter(file => file.peerId === peer.current?.getPeerId())
        .map(file => {
          return {
            ...file,
            raw: []
          }
        })
    )
  }, [myPeerId, navigate, pathname, roomFiles])

  /**
   * 用户离开，删除离开用户的缓存
   */
  const userLeaveRoom = useCallback((peerId:string) => {
    if (!peer.current) return
    console.log('有用户离开房间，清除它的文件')
    setLinkedNum(state => state - 1)
    // 替换成目前在连接的节点
    const connPeer = peer.current.getCanSendConnections()
    const id = Object.keys(connPeer)[ 0 ]

    navigate(`${ pathname }?myPeerId=${ myPeerId }&connectId=${ id || '' }`, { replace: true })

    // 删除该节点相关的文件
    delDisconnectedFiles(peerId)
  }, [delDisconnectedFiles, myPeerId, navigate, pathname])

  /**
   * 请求下载回调（收到请求下载）
   * 把文件流发给对应的节点
   */
  const reqDownloadCallback = useCallback((peerId:string, file: FileType) => {
    const bufferFile = roomFiles.find(item => item.id === file.id)

    /* 只发对应下标的raw过去 */
    if (bufferFile) {
      for (let i = 0; i < bufferFile.raw.length; i++) {
        peer.current?.pushTransferFn({
          peerId,
          event: roomPeerCallback.resDownload,
          data: {
            fileId: file.id,
            index: i,
            raw: bufferFile.raw[ i ]
          }
        })
      }
      console.log(peer.current?.getTransferQueue())
      peer.current?.runTransfer()
      updateFileStatus(file.id, FILE_STATUS.sending)
    }
  }, [roomFiles, updateFileStatus])

  /**
   * 响应文件下载（接收文件流）
   * 文件流转成文件下载
   */
  const resDownloadCallback = useCallback((peerId: string, { data: file }: {data:TransferType}) => {
    console.log('收到下载数据', peerId, file)
    // 记录缓存
    setRoomFiles(files => files.map(item => {
      if (item.id === file.fileId) {
        const raw = item.raw.concat(file.raw)
        const newFile = {
          ...item,
          raw
        }

        // 判断raw是否已经接受完成
        if (raw.length === fileChunkNum(item.size)) {
          // 下载该文件
          downloadFile(newFile)
          // 更新该文件的状态
          updateFileStatus(file.fileId, FILE_STATUS.leisure)
          // 通知对方，下载完成
          peer.current?.sendDataToPeer(peerId, roomPeerCallback.downloadFinish, {
            fileId: file.fileId,
            index: file.index
          })
        }
        return newFile
      }
      return item
    }))
    setFresh(state => state + 1)
  }, [downloadFile, setRoomFiles, updateFileStatus])

  /**
   * 下载完成回调
   */
  const downLoadFinishCallback = useCallback((peerId: string, file: TransferType) => {
    console.log('对方下载已完成', peerId, file)
    updateFileStatus(file.fileId, FILE_STATUS.leisure)
  }, [updateFileStatus])

  /**
   * 连接出现错误，删除对应peerId的文件
   */
  const connectionError = useCallback((peerId: string) => {
    setLinkingNum(state => state - 1)
    userLeaveRoom(peerId)
    roomFiles.forEach(item => updateFileStatus(item.id, FILE_STATUS.leisure))
  }, [roomFiles, updateFileStatus, userLeaveRoom])

  const initRoom = useCallback(async() => {
    // 初始化本机peer
    peer.current = new PeerLink({
      myPeerId
    })
    setFresh(state => state + 1)
  }, [myPeerId])

  /**
   * 点击下载文件
   * 向对应文件的作者，发出下载请求。
   */
  const onclickDownloadFile = useCallback((file:FileType) => {
    // 自己的文件，不要下载
    if (file.peerId === peer.current?.getPeerId()) return
    // 下载中，不能进行
    if (file.status === FILE_STATUS.sending) return

    if (file.raw.length === fileChunkNum(file.size)) {
      downloadFile(file)
      return
    }
    const sendRes = peer.current?.sendDataToPeer(file.peerId, roomPeerCallback.reqDownload, file)

    if (sendRes) { // 消息发送出去了
      updateFileStatus(file.id, FILE_STATUS.sending)
    } else { // 消息没发送出去
      $warning('该节点已经退出房间')
      userLeaveRoom(file.peerId)
    }
  }, [downloadFile, updateFileStatus, userLeaveRoom])

  useEffect(() => {
    initRoom()

    // 监听用户离开当前页面，销毁自己的节点，并与其他节点断开连接
    window.onbeforeunload = function() {
      peer.current?.iDestroy()
      peer.current = undefined
    }

    return () => {
      peer.current?.iDestroy()
      peer.current = undefined
      window.onbeforeunload = null // 释放缓存
    }
  }, [initRoom])

  useEffect(() => {
    // 注册回调事件
    peer.current?.registerCallback(peerCallbackEnum.openedPeer, myPeerOpened) // 我的节点已打开
    peer.current?.registerCallback(peerCallbackEnum.linkPeer, linkPeer) // 连接某个节点
    peer.current?.registerCallback(peerCallbackEnum.otherOpened, otherOpened) // 对方节点已打开，说明连接完成
    peer.current?.registerCallback(peerCallbackEnum.aPeerDisconnected, userLeaveRoom) // 有一个节点离开房间
    peer.current?.registerCallback(peerCallbackEnum.connectionError, connectionError) // 连接发生错误
    peer.current?.registerCallback(peerCallbackEnum.peerError, connectionError) // 连接发生错误
    peer.current?.registerCallback(peerCallbackEnum.transferError, connectionError) // 连接发生错误
    peer.current?.registerCallback(roomPeerCallback.addFiles, addFiles) // 添加文件
    peer.current?.registerCallback(roomPeerCallback.reqDownload, reqDownloadCallback) // 请求下载文件
    peer.current?.registerCallback(roomPeerCallback.resDownload, resDownloadCallback) // 响应下载文件
    peer.current?.registerCallback(roomPeerCallback.downloadFinish, downLoadFinishCallback) // 下载完成
  }, [addFiles, connectionError, downLoadFinishCallback, linkPeer, myPeerOpened, otherOpened, reqDownloadCallback, resDownloadCallback, userLeaveRoom])

  return {
    roomFiles,
    setRoomFiles,
    linkingNum,
    sendDataToOtherPeers: (event:string, data:any) => { peer.current?.sendDataToOtherPeers(event, data) },
    peerId: peer.current?.getPeerId(),
    peer,
    refresh,
    setFresh,
    onclickDownloadFile,
    linkedNum
  }
}
