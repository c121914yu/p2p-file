/**
 * 计算文件会被分割成多少个块
 */
export const fileChunkNum = (fileSize: number) => Math.ceil(fileSize / 1024 / 1024)
