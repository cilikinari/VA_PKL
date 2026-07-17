import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeScreen from "./screen/HomeScreen";
import ChatScreen from "./screen/ChatScreen";
import LoginPage from "./screen/LoginPage";
import AdminPanel from "./screen/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Jika URL kosong (halaman awal), tampilkan HomeScreen */}
        <Route path="/" element={<HomeScreen />} />
        {/* Jika URL /login, tampilkan LoginPage */}
        <Route path="/login" element={<LoginPage />} />
        {/* Jika URL /admin, tampilkan AdminPanel */}
        <Route path="/admin" element={<AdminPanel />} />
        {/* Jika URL /chat, tampilkan ChatScreen */}
        <Route path="/chat" element={<ChatScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
