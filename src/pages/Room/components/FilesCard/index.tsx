import React, { useMemo } from 'react'
import { Card, Tag, Empty, Row, Col, Progress } from 'antd'
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons'
import { FILE_STATUS, FILE_STATUS_TEXT } from '@/constants'
import { FileType } from '@/types'
import { fileChunkNum } from '../../utils'

import './index.scss'

interface Props {
  files: FileType[]
  setFiles?: (files:FileType[]) => void
  peerId?: string
  onclickDownloadFile: (file:FileType) => void
}

const FilesCard = ({
  files,
  peerId,
  onclickDownloadFile
}:Props) => {
  const screenWidth = useMemo(() => document.body.clientWidth, [])

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
              span={screenWidth < 700 ? 24 : 12}
            >
              <Card
                type='inner'
                hoverable
                className="file"
              >
                <div className="left">
                  <div className="name">{file.name}</div>
                  <div className="size">{file.formatSize}</div>
                  <Progress
                    percent={(() => Math.floor(file.raw.length / fileChunkNum(file.size) * 100))()}
                    size="small"
                  />
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
                  {/* 下载按键 */}
                  {
                    file.status !== FILE_STATUS.sending && file.peerId !== peerId && (
                      <div
                        className="icon"
                        onClick={() => onclickDownloadFile(file)}>
                        <DownloadOutlined style={{ fontSize: 16 }} />
                      </div>
                    )
                  }
                  {/* 加载中icon */}
                  {
                    file.status === FILE_STATUS.sending && (
                      <div className="icon">
                        <LoadingOutlined style={{ fontSize: 16 }} />
                      </div>
                    )
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
