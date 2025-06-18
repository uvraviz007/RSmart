import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import SignUp from './components/SignUp'
import Login from './components/Login'
import AboutUs from './components/AboutUs'
import Profile from './components/Profile'
import AddItem from './components/AddItem' // Assuming you have an AddItem component



function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/additem" element={<AddItem />} />
      </Routes>
    </div>
  )
}

export default App
