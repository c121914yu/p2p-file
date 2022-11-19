import { useRef, useState, useEffect, useCallback } from 'react'
import { FileType } from '@/types'
import { peerCallbackEnum, FILE_STATUS } from '@/constants'
import { $warning } from '@/utils'
import useRoute from '@/hooks/useRoute'
import { PeerLink } from '../utils/peer'
import { useFiles } from './useFile'

export function useRoom() {
  const { connectId, myPeerId } = useRoute()
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
   * 对方节点已打开
   */
  const otherOpened = useCallback((peerId:string) => {
    setLinking(false)
    // 向对方发送我的附件信息
    setRoomFiles(files => {
      files.length > 0 && peer.current?.sendDataToPeer(
        peerId,
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
  }, [setRoomFiles])

  /**
   * 用户离开，删除离开用户的缓存
   */
  const userLeaveRoom = useCallback((peerId:string) => {
    if (!peer.current) return
    console.log('有用户离开房间，清除它的文件')
    // 删除该节点相关的文件
    delDisconnectedFiles(peerId)
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

  /**
   * 初始化节点
   */
  const initPeer = useCallback(() => new Promise<PeerLink>(resolve => {
    peer.current = new PeerLink({
      myPeerId,
      openedCb: (peer: PeerLink) => {
        // 如果存在connectId，则触发节点连接
        if (connectId) {
          peer.connectPeer(connectId)
        }
        resolve(peer)
      }
    })
  }), [myPeerId, connectId])

  const initRoom = useCallback(async() => {
    // 初始化本机peer
    const peer = await initPeer()

    // 注册回调事件
    peer.registerCallback(peerCallbackEnum.otherOpened, otherOpened) // 对方节点已打开，说明连接完成
    peer.registerCallback(peerCallbackEnum.addFiles, addFiles)
    peer.registerCallback(peerCallbackEnum.peerDisconnect, userLeaveRoom)
    peer.registerCallback(peerCallbackEnum.reqDownload, reqDownloadCallback)
    peer.registerCallback(peerCallbackEnum.resDownload, resDownloadCallback)
    peer.registerCallback(peerCallbackEnum.downloadError, downloadErrorCallback)
    peer.registerCallback(peerCallbackEnum.downloadFinish, downLoadFinishCallback)
    setFresh(state => state + 1)
  }, [initPeer, otherOpened, addFiles, userLeaveRoom, reqDownloadCallback, resDownloadCallback, downloadErrorCallback, downLoadFinishCallback])

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
      delDisconnectedFiles(file.peerId)
    }
  }, [delDisconnectedFiles, downloadFile, updateFileStatus])

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
  }, [])

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
