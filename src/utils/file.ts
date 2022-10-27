/**
 * 选择的文件转URL
 */
export function fileToUrl(file:File) {
  return window.URL.createObjectURL(file)
}

/**
 * 计算文件大小
 */
export function formatSize(fSize:number) {
  const unitArr = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const index = Math.floor(Math.log(fSize) / Math.log(1024))

  const size = (fSize / Math.pow(1024, index)).toFixed(2)

  return size + unitArr[ index ]
}
