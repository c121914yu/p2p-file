import React, { useEffect, useCallback, useMemo } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { FILE_STATUS, peerCallbackEnum } from '@/constants'
import { FileType } from '@/types'
import { formatSize } from '@/utils'
import ChooseFile from '@/components/ChooseFile'
import FileItem from './components/FilesCard'
import { useRoom } from './hooks/useRoom'
import './index.scss'

const Room = () => {

  const {
    roomFiles,
    setRoomFiles,
    peerId,
    sendDataToOtherPeers,
    linking
  } = useRoom()

  const canAdd = useMemo(() => !!peerId && !linking, [linking, peerId])

  /**
   * 选择文件，更新本地文件，并通知其他用户更新
   */
  const selectFiles = useCallback(async(files:File[] | FileType[]) => {
    if (!peerId) return
    const newFiles = files.map((file, i:number) => {
      return {
        id: `${ Date.now() }-${ i }`,
        name: file.name,
        size: formatSize(file.size),
        status: FILE_STATUS.leisure,
        raw: file,
        peerId
      }
    })

    setRoomFiles([...newFiles, ...roomFiles])
    sendDataToOtherPeers(peerCallbackEnum[ 'addFiles' ], newFiles.map(file => {
      return {
        ...file,
        raw: null
      }
    }))
  }, [peerId, setRoomFiles, roomFiles, sendDataToOtherPeers])

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
      <div className="add-btn">
        <ChooseFile
          disabled={!canAdd}
          chooseFile={selectFiles}>
          <Button
            size='large'
            shape='circle'
            type='primary'
            disabled={!canAdd}
            icon={<PlusOutlined />}
          />
        </ChooseFile>
      </div>
      <FileItem
        files={roomFiles}
        setFiles={selectFiles}
      />
    </div>
  )
}

export default Room
