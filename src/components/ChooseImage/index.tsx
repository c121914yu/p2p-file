import React, { memo } from 'react'
import { Image } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import './index.scss'

interface Props {
  src?: string
  size?: number | string,
  desc?:string,
  setFile: (file:File) => void
}

const ChooseImage = ({
  src,
  size = 100,
  desc = '点击选择图片',
  setFile
}:Props) => (
  <div
    style={{
      width: size,
      height: size
    }}
    className="choose-image"
  >
    <label className="choose-image-label">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files?.length > 0) {
            setFile(e.target.files[ 0 ])
          }
        }}
      />
      {
        src
          ? (
            <div className='choose-image-container'>
              <Image
                src={src}
                style={{ width: size }}
                preview={false}
              />
            </div>
          )
          : (
            <div className='choose-image-picker'>
              <PlusOutlined style={{ fontSize: 24, color: '#595959' }} />
              <div>{desc}</div>
            </div>
          )
      }
    </label>

  </div>
)

export default memo(ChooseImage)
