import React, { memo } from 'react'

import './index.scss'
import { $warning } from '@/utils'

interface Props {
  children: React.ReactNode
  chooseFile: (file:File[]) => void
  multiple?: boolean
  accept?: string
  maxSize?: number // 多少M
  disabled?: boolean
}

const ChooseFile = ({
  children,
  chooseFile,
  multiple = true,
  accept = '*',
  maxSize = 99999,
  disabled = true
}:Props) => (
  <label className="choose-file">
    {children}
    <input
      type="file"
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      onChange={(e) => {
        if (e.target.files && e.target.files?.length > 0) {
          chooseFile(Array.from(e.target.files)
            .filter(file => {
              const MAX_SIZE = maxSize * 1024 * 1024

              if (file.size > MAX_SIZE) {
                $warning(`超出${ maxSize }M的文件将被过滤`, { key: 'filterFile' })
              }
              return file.size <= MAX_SIZE
            }))
        }
      }}
    />
  </label>
)

export default memo(ChooseFile)
