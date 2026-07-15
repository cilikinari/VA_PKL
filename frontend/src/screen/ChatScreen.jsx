import React from 'react';
import BackButton from '../widgets/BackButton'; // Import komponennya

const ChatScreen = () => {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
      
      {/* Panggil komponen BackButton di bagian paling atas */}
      <BackButton />

      <div style={{ textAlign: 'center', color: '#0f172a', marginTop: '60px' }}>
        <h1>Halaman Chat</h1>
        <p>Tombol kembali di atas sudah berfungsi!</p>
      </div>

    </div>
  );
};

export default ChatScreen;