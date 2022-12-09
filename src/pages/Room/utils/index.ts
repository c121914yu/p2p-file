/**
 * 每个文件被拆成多大
 */
export const fileChunkSize = 0.1 * 1024 * 1024
/**
 * 计算文件会被分割成多少个块
 */
export const fileChunkNum = (fileSize: number) => Math.ceil(fileSize / fileChunkSize)
