import React, { Dispatch } from 'react'
import { Card, Tag, Empty, Row, Col } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { FILE_STATUS, FILE_STATUS_TEXT } from '@/constants'
import { FileType } from '@/types'

import './index.scss'

interface Props {
  files: FileType[]
  setFiles?: (files:FileType[]) => void
}

const FilesCard = ({
  files,
  setFiles
}:Props) => {
  console.log(files)
  return (
    <div>
      <Row
        gutter={[15, 15]}
        className="files-card"
      >
        {
          files.map((file) => (
            <Col
              key={file.id}
              span={12}
            >
              <Card
                type='inner'
                hoverable
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
                  {/* {
                    setFiles && file.status !== FILE_STATUS.sending && (
                      <div
                        className="delete"
                        onClick={() => {
                          if (!confirm('确认移除该文件？')) return
                          setFiles(files.filter(item => item.id !== file.id))
                        }}>
                        <DeleteOutlined style={{ fontSize: 16 }} />
                      </div>
                    )
                  } */}
                </div>
              </Card>
            </Col>
          ))
        }
      </Row>

      {
        files.length === 0 && (
          <Empty
            style={{ fontSize: 14 }}
            description='还没有文件...'/>
        )
      }
    </div>
  )
}

export default FilesCard
