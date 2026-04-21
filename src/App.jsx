import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './views/Home'
import AddRun from './views/AddRun'
import UpdateRun from './views/UpdateRun'
import ShowAllRun from './views/ShowAllRun'

export default function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/addrun" element={<AddRun />} />
        <Route path="/updaterun/:id" element={<UpdateRun />} />
        <Route path="/showallrun" element={<ShowAllRun />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}
