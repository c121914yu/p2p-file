import { useState, useCallback } from 'react'
import { FileType } from '@/types'
import { FILE_STATUS } from '@/constants'

export function useFiles() {
  const [roomFiles, setRoomFiles] = useState<FileType[]>([])

  /**
   * 某个用户增加文件
   * 直接追加文件
   * @param {String} peerId 对方的peerId
   */
  const addFiles = useCallback((peerId:string, files:FileType[]) => {
    setRoomFiles(state => state.concat(files))
    console.log(peerId, files, '某个用户文件更新啦')
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
    if (!file.raw) return

    const url = window.URL.createObjectURL(new Blob([file.raw], { type: 'arraybuffer' }))
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
    updateFileStatus
  }
}
