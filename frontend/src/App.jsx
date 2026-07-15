import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import HomeScreen from './screen/HomeScreen';
import ChatScreen from './screen/ChatScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Jika URL kosong (halaman awal), tampilkan HomeScreen */}
        <Route path="/" element={<HomeScreen />} />
        {/* Jika URL /chat, tampilkan ChatScreen */}
        <Route path="/chat" element={<ChatScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
