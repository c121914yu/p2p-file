import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { HashRouter } from 'react-router-dom'

import 'antd/dist/antd.less'
import './index.scss'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
  .render(<React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>)
