import React, { useState, useEffect, useCallback } from 'react'
import { Card, Row, Col, Button, Tag, Empty } from 'antd'
import { LOGO, FILE_STATUS, FILE_STATUS_TEXT } from '@/constants'
import { FileType } from '@/types'
import { formatSize } from '@/utils'
import AhaAvatar from '@/components/Avatar'
import ChooseFile from '@/components/ChooseFile'
import FileItem from './components/FileItem'
import './index.scss'

const Room = () => {
  const [myFiles, setMyFiles] = useState<FileType[]>([])

  const selectFiles = useCallback(async(files:File[]) => {
    setMyFiles(files.map(file => {
      return {
        id: file.lastModified,
        name: file.name,
        size: formatSize(file.size),
        status: FILE_STATUS.leisure,
        raw: file
      }
    }).concat(myFiles))
  }, [myFiles])

  /* 加载动画 */
  useEffect(() => {
    window.particlesJS('animation', {
      particles: {
        number: {
          value: 40,
          density: {
            enable: true,
            value_area: 500,
          },
        },
        color: {
          value: '#859bf4',
        },
        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#000000',
          },
          polygon: {
            nb_sides: 5,
          },
        },
        opacity: {
          value: 0.5,
          random: false,
          anim: {
            enable: false,
            speed: 0.1,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
            speed: 10,
            size_min: 0.1,
            sync: false,
          },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#a4b4f7',
          opacity: 0.4,
          width: 1,
        },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200,
          },
        },
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'grab',
          },
          onclick: {
            enable: true,
            mode: 'push',
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 1,
            },
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
          push: {
            particles_nb: 4,
          },
          remove: {
            particles_nb: 2,
          },
        },
      },
      retina_detect: true,
    })
  }, [])

  return (
    <div className='room'>
      <div
        id='animation'
        className="animation"
      />
      <Row
        className="files-card"
        gutter={[15, 15]}
      >
        <Col span={8}>
          <FileItem
            title={(
              <header>
                <AhaAvatar
                  url={LOGO}
                  size="30"
                />
                <span className='name'>我的文件</span>
                <ChooseFile chooseFile={selectFiles}>
                  <Button>选择文件</Button>
                </ChooseFile>
              </header>
            )}
            files={myFiles}
            emptyText="点击右上角选择文件进行分享吧"
            setMyFiles={setMyFiles}
          />
        </Col>
        <Col span={8}>
          <FileItem
            title={(
              <header>
                <AhaAvatar
                  url={LOGO}
                  size="30"
                />
                <span className='name'>yjl文件</span>
              </header>
            )}
            files={myFiles}
          />
        </Col>
        <Col span={8}>
          <Card
            className="files-card-item"
            hoverable
          >
            <header>
              <AhaAvatar
                url={LOGO}
                size="30"
              />
              <span className='name'>我的文件</span>
            </header>
            <main>
              <div className="file">
                <div className="left">
                  <div className="name">下属身上</div>
                  <div className="size">22KB</div>
                </div>
                <div className="delete"></div>
              </div>
            </main>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            className="files-card-item"
            hoverable
          >
            <header>
              <AhaAvatar
                url={LOGO}
                size="30"
              />
              <span className='name'>我的文件</span>
            </header>
            <main>
              <div className="file">
                <div className="left">
                  <div className="name">下属身上</div>
                  <div className="size">22KB</div>
                </div>
                <div className="delete"></div>
              </div>
            </main>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Room
