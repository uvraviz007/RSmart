import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import SignUp from './components/SignUp'
import Login from './components/Login'
import AboutUs from './components/AboutUs'
import Profile from './components/Profile'
import AddItem from './components/AddItem' // Assuming you have an AddItem component
import MyListedItems from './components/MyListedItems'
import PurchaseHistory from './components/PurchaseHistory'

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
        <Route path="/my-listed-items" element={<MyListedItems />} />
        <Route path="/purchase-history" element={<PurchaseHistory />} />
      </Routes>
    </div>
  )
}

export default App
