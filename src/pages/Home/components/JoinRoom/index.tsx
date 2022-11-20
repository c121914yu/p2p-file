import React, { useState, useCallback } from 'react'
import { Input, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import { v4 } from 'uuid'
import './index.scss'

interface Props {
  onClose: () => void
}

const JoinRoomModal = ({
  onClose
}: Props) => {
  const navigate = useNavigate()
  const [roomId, setRoomId] = useState('')

  const onOk = useCallback(() => {
    if (!roomId) return
    navigate(`/room?myPeerId=${ v4() }&connectId=${ roomId }`)
    onClose()
  }, [roomId, navigate, onClose])

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
        加入房间
      </h3>
      <Input
        value={roomId}
        placeholder='请输入对方的ID'
        onChange={(e) => setRoomId(e.target.value)}
      />
    </Modal>
  )
}

export default JoinRoomModal
