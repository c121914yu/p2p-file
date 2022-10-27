import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import { LOGO } from '@/constants'
import Avatar from '@/components/Avatar'
import CreateRoomModal from './components/CreateRoom'
import JoinRoomModal from './components/JoinRoom'

import './index.scss'

const Home = () => {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

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
    <div className='home'>
      <div
        id='animation'
        className="animation"
      />

      <div className="logo">
        <Avatar
          url={LOGO}
          size="120"
        />
      </div>

      <div className='title'>Aha文件传输助手</div>

      <ul>
        <li><h3>无需注册</h3></li>
        <li><h3>安全可靠</h3></li>
        <li><h3>不限速</h3></li>
      </ul>

      <div className="btn">
        <div>
          <Button
            size="large"
            type="primary"
            onClick={() => setShowCreate(true)}
          >
          发送文件
          </Button>
        </div>
        <div>
          <Button
            style={{ marginTop: 20 }}
            size="large"
            type="primary"
            ghost
            onClick={() => setShowJoin(true)}
          >
          接收文件
          </Button>
        </div>
      </div>

      <div className="modal">
        {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
        {showJoin && <JoinRoomModal onClose={() => setShowJoin(false)} />}
      </div>
    </div>
  )
}

export default Home
