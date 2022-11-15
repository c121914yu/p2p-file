import { useState, useCallback } from 'react'
import { FileType } from '@/types'

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

  return {
    roomFiles,
    setRoomFiles,
    addFiles
  }
}
