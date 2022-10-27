import { FILE_STATUS } from '@/constants'

export interface FileType {
    id: number
    name: string
    size: string
    status: number
    raw: File
}
