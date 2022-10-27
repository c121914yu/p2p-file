import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '@/pages/Home'
import Room from '@/pages/Room'

const Router = () => (
  <Routes>
    <Route
      path="/"
      element={<Home />}/>
    <Route
      path="/room/:id"
      element={<Room />}/>
    <Route
      path="*"
      element={<Navigate to="/" />} />
  </Routes>
)

export default Router
