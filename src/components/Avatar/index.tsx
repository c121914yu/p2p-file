import React from 'react'
import { Avatar } from 'antd'
import { LOGO } from '@/constants'
import './index.scss'

interface Props {
  url?: string
  size?: number | string
}

const AhaAvatar = ({ url = LOGO, size = 30 }: Props) => (
  <div className="aha-avatar">
    <Avatar
      size={+size}
      src={url}
    />
  </div>
)

export default AhaAvatar
