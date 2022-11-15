import { FILE_STATUS } from '@/constants'
import { UserType } from './index'

export interface FileType {
    id: string | number
    name: string
    size: string
    status: `${ FILE_STATUS }`
    raw: File | null,
    peerId: string
}
