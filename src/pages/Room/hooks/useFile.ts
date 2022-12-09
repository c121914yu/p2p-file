import { useState, useCallback } from 'react'
import { FileType, FileBlobItem } from '@/types'
import { FILE_STATUS } from '@/constants'
import { $info } from '@/utils'

export function useFiles() {
  const [roomFiles, setRoomFiles] = useState<FileType[]>([])

  /**
   * 某个用户增加文件
   * 直接追加文件
   * @param {String} peerId 对方的peerId
   */
  const addFiles = useCallback((peerId:string, files:FileType[]) => {
    setRoomFiles(state => state.concat(files))
    $info('有文件更新啦', { key: Date.now() })
    console.log(`用户 ${ peerId } 的文件更新啦`, files)
  }, [])

  /**
   * 删除已经离线节点的文件
   */
  const delDisconnectedFiles = useCallback((peerId:string) => {
    setRoomFiles(files => files.filter(file => file.peerId !== peerId))
  }, [])

  /**
   * 根据fileId，更新文件的状态
   */
  const updateFileStatus = useCallback((fileId:string, status: `${ FILE_STATUS }`) => {
    setRoomFiles(files => files.map(file => file.id === fileId
      ? {
        ...file,
        status
      }
      : file))
  }, [])

  /**
   * 根据二进制流，下载某个文件
   */
  const downloadFile = useCallback((file:FileType) => {
    file.raw.sort((a, b) => a.index - b.index)
    const blobs = file.raw.map(item => item.blob)
    const compBlobs = blobs.flat()

    const url = window.URL.createObjectURL(new Blob(compBlobs, { type: 'arraybuffer' }))
    const link = document.createElement('a')

    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', file.name)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  return {
    roomFiles,
    setRoomFiles,
    addFiles,
    downloadFile,
    updateFileStatus,
    delDisconnectedFiles
  }
}
