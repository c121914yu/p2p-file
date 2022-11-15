import { FILE_STATUS } from '@/constants'
import { UserType } from './index'

export interface FileType {
    id: string
    name: string
    size: string
    status: `${ FILE_STATUS }`
    raw: File | ArrayBuffer |null,
    peerId: string
}
