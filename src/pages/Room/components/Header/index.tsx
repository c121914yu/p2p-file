import React from 'react'
import './index.scss'

interface Props {
  peerId?: string
  peerNum: number
}

const RoomHeader = ({
  peerId,
  peerNum
}:Props) => (
  <div className='room-header'>
    <div>
      我的ID：{peerId}
    </div>
    <div style={{ marginLeft: 30 }}>
        当前房间人数：{peerNum}
    </div>
  </div>
)

export default RoomHeader
