import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '@/pages/Home'
import Template from '@/pages/Template'

const Router = () => (
  <Routes>
    <Route path="/" element={<Home />}></Route>
    <Route path="/template" element={<Template />}></Route>
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
)

export default Router
