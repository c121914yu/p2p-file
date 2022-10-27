import React, { useCallback } from 'react'
import { Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import './index.scss'

interface Props {
  onClose: () => void
}

const CreateRoomModal = ({
  onClose
}: Props) => {
  const navigate = useNavigate()
  const onOk = useCallback(() => {
    navigate('/room/fasts')
    onClose()
  }, [navigate, onClose])

  return (
    <Modal
      open
      onCancel={onClose}
      onOk={onOk}
    >
      <h3
        style={{
          marginBottom: 10,
          color: '#6782f1'
        }}>
        创建房间
      </h3>
      <div>目前处于试用阶段，您可直接点击确认进入文件分享房间</div>
    </Modal>
  )
}

export default CreateRoomModal
