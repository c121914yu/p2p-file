import { useRef, useState, useEffect, useCallback } from 'react'
import { FileType, TransferType } from '@/types'
import { useNavigate } from 'react-router-dom'
import { roomPeerCallback, FILE_STATUS } from '@/constants'
import useRoute from '@/hooks/useRoute'
import { $loading, $error, $hideMsg, $info } from '@/utils'
import { peerCallbackEnum } from '../utils/peer.constants'
import { PeerLink } from '../utils/peer'
import { useFiles } from './useFile'
import { fileChunkNum } from '../utils/index'

export function useRoom() {
  const { connectId, myPeerId, pathname } = useRoute()
  const navigate = useNavigate()
  const peer = useRef<PeerLink>()
  const [linkingNum, setLinkingNum] = useState(0)
  const [linkedNum, setLinkedNum] = useState(1) // 自己默认连接
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
   * 打开我的节点
   */
  const openMyPeer = useCallback(() => {
    $loading('正在获取我的节点')
    setLinkingNum(state => state + 1)
  }, [])

  /**
   * 我的节点已打开
   */
  const myPeerOpened = useCallback(() => {
    // 如果存在connectId，则触发节点连接
    if (connectId) {
      peer.current?.connectPeer(connectId)
    } else {
      $hideMsg()
    }
  }, [connectId])

  /**
   * 开始连接其他节点
   */
  const linkPeer = useCallback(() => {
    $loading('有用户正在加入')
    setLinkingNum(state => state + 1)
    setLinkedNum(state => state + 1)
  }, [])

  /**
   * 节点出现错误, 连接中数量减一。（可能是自己错误，也可能是link时错误）
   */
  const peerError = useCallback(() => {
    $error('有用户加入失败了')
    setLinkingNum(state => state - 1)
    setLinkedNum(state => state - 1)

    // 更改url到一个连接中的节点
    const connPeers = peer?.current?.getCanSendConnections()

    if (connPeers) {
      const id = connPeers[ 0 ]?.peer || ''

      navigate(`${ pathname }?myPeerId=${ myPeerId }&connectId=${ id }`, { replace: true })
    }

  }, [myPeerId, navigate, pathname])

  /**
   * 对方节点已打开
   */
  const otherOpened = useCallback((peerId:string) => {
    $hideMsg()
    setLinkingNum(state => state - 1)

    // 替换域名，connectId指向最新节点
    navigate(`${ pathname }?myPeerId=${ myPeerId }&connectId=${ peerId || '' }`, { replace: true })

    // 向对方发送我的附件信息
    roomFiles.length > 0 && peer.current?.pushTransferFn({
      peerId,
      event: roomPeerCallback.addFiles,
      data: roomFiles.filter(file => file.peerId === peer.current?.getPeerId())
        .map(file => {
          return {
            ...file,
            raw: [] // 不要发送文件数据
          }
        }),
      priority: true, // 优先发送
    })
  }, [myPeerId, navigate, pathname, roomFiles])

  /**
   * 用户离开，删除离开用户的缓存
   */
  const userLeaveRoom = useCallback((peerId:string) => {
    if (!peer.current) return
    console.log('有用户离开房间，清除它的文件')
    $info('有用户离开了房间', { key: Date.now() })
    setLinkedNum(state => state - 1)

    // 替换成目前在连接的节点
    const connPeers = peer?.current?.getCanSendConnections()

    if (connPeers && connPeers.length > 0) {
      const id = connPeers[ 0 ]?.peer || ''

      navigate(`${ pathname }?myPeerId=${ myPeerId }&connectId=${ id }`, { replace: true })
    }

    // 删除该节点相关的文件
    delDisconnectedFiles(peerId)
  }, [delDisconnectedFiles, myPeerId, navigate, pathname])

  /**
   * 请求下载回调（收到请求下载）
   * 把文件流发给对应的节点
   */
  const reqDownloadCallback = useCallback((peerId:string, file: FileType) => {
    const bufferFile = roomFiles.find(item => item.id === file.id)

    if (!bufferFile) return
    $info(`有用户请求下载文件: ${ file.name }`, { key: Date.now() })

    for (let i = 0; i < bufferFile.raw.length; i++) {
      peer.current?.pushTransferFn({
        peerId,
        event: roomPeerCallback.resDownload,
        data: {
          fileId: file.id,
          index: i,
          raw: bufferFile.raw[ i ]
        },
        priority: false
      })
    }
    updateFileStatus(file.id, FILE_STATUS.sending)
  }, [roomFiles, updateFileStatus])

  /**
   * 响应文件下载（接收文件流）
   * 文件流转成文件下载
   */
  const resDownloadCallback = useCallback((peerId: string, file: TransferType) => {
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
          peer.current?.pushTransferFn({
            peerId,
            event: roomPeerCallback.downloadFinish,
            data: file.fileId,
            priority: true
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
  const downLoadFinishCallback = useCallback((peerId: string, fileId:string) => {
    console.log('对方下载已完成', peerId, fileId)
    updateFileStatus(fileId, FILE_STATUS.leisure)
  }, [updateFileStatus])

  /**
   * 节点间连接有错误。验证该节点是否正确
   */
  const connectionError = useCallback((peerId: string) => {
    const isConnected = peer.current?.checkConn(peerId)

    if (!isConnected) {
      console.log('该节点已经断开，删除它')
      userLeaveRoom(peerId)
    }

    roomFiles.forEach(item => {
      // 我自己的文件都改成leisure
      if (item.peerId === peer.current?.getPeerId()) {
        updateFileStatus(item.id, FILE_STATUS.leisure)
      }
    })
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
    // 已经有缓存了，则直接下载
    if (file.raw.length === fileChunkNum(file.size)) {
      downloadFile(file)
      return
    }
    peer.current?.pushTransferFn({
      peerId: file.peerId,
      event: roomPeerCallback.reqDownload,
      data: file
    })
    updateFileStatus(file.id, FILE_STATUS.sending)
  }, [downloadFile, updateFileStatus])

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
    peer.current?.registerCallback(peerCallbackEnum.openMyPeer, openMyPeer) // 我的节点已打开
    peer.current?.registerCallback(peerCallbackEnum.openedPeer, myPeerOpened) // 我的节点已打开
    peer.current?.registerCallback(peerCallbackEnum.linkPeer, linkPeer) // 连接某个节点
    peer.current?.registerCallback(peerCallbackEnum.otherOpened, otherOpened) // 对方节点已打开，说明连接完成
    peer.current?.registerCallback(peerCallbackEnum.aPeerDisconnected, userLeaveRoom) // 有一个节点离开房间
    peer.current?.registerCallback(peerCallbackEnum.peerError, peerError) // 节点发生错误
    peer.current?.registerCallback(peerCallbackEnum.connectionError, connectionError) // 节点打开/通信发生错误
    peer.current?.registerCallback(peerCallbackEnum.transferError, connectionError) // 传输发生错误
    peer.current?.registerCallback(roomPeerCallback.addFiles, addFiles) // 添加文件
    peer.current?.registerCallback(roomPeerCallback.reqDownload, reqDownloadCallback) // 请求下载文件
    peer.current?.registerCallback(roomPeerCallback.resDownload, resDownloadCallback) // 响应下载文件
    peer.current?.registerCallback(roomPeerCallback.downloadFinish, downLoadFinishCallback) // 下载完成
  }, [addFiles, peerError, downLoadFinishCallback, linkPeer, myPeerOpened, otherOpened, reqDownloadCallback, resDownloadCallback, userLeaveRoom, connectionError, openMyPeer])

  return {
    roomFiles,
    setRoomFiles,
    linkingNum,
    sendDataToOtherPeers: (event:string, data:any) => { peer.current?.sendDataToOtherPeers({ event, data }) },
    peerId: peer.current?.getPeerId(),
    peer,
    refresh,
    setFresh,
    onclickDownloadFile,
    linkedNum
  }
}
