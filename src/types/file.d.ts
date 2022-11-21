import { FILE_STATUS } from '@/constants'

export interface FileType {
    id: string
    name: string
    size: number
    formatSize: string
    status: `${ FILE_STATUS }`
    raw: FileBlobItem[],
    peerId: string
}
export interface FileBlobItem {
    index: number
    blob: Blob
}

export interface TransferType {
    index: number
    fileId: string
    raw: FileBlobItem
}
