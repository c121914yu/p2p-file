import React, { Dispatch } from 'react'
import { Card, Tag, Empty } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { FILE_STATUS, FILE_STATUS_TEXT } from '@/constants'
import { FileType } from '@/types'

import './index.scss'

interface Props {
  title: React.ReactNode
  files: FileType[]
  emptyText?: string
  setMyFiles?: Dispatch<FileType[]>
}

const FileItem = ({
  title,
  files,
  emptyText = '这个人还没分享文件',
  setMyFiles
}:Props) => {
  console.log('template')
  return (
    <Card
      className="files-card-item"
      type='inner'
      hoverable
      title={title}
    >
      {
        files.map((file) => (
          <div
            key={file.id}
            className="file"
          >
            <div className="left">
              <div className="name">{file.name}</div>
              <div className="size">{file.size}</div>
            </div>
            <div className="right">
              {
                (() => {
                  const statusMap = FILE_STATUS_TEXT[ file.status ]

                  return (
                    <Tag
                      className="status"
                      color={statusMap.color}>
                      {statusMap.label}
                    </Tag>
                  )
                })()
              }
              {
                setMyFiles && file.status !== FILE_STATUS.sending && (
                  <div
                    className="delete"
                    onClick={() => {
                      if (!confirm('确认移除该文件？')) return
                      setMyFiles(files.filter(item => item.id !== file.id))
                    }}>
                    <DeleteOutlined />
                  </div>
                )
              }
            </div>
          </div>
        ))
      }
      {
        files.length === 0 && (
          <Empty
            style={{ fontSize: 14 }}
            description={emptyText}/>
        )
      }
    </Card>
  )
}

export default FileItem
