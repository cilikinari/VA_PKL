import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../ui-widgets/BackButton.css';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    // navigate(-1) artinya kembali ke 1 halaman sebelumnya di history browser
    <button className="back-button" onClick={() => navigate(-1)}>
      {/* Ikon Panah Kiri (SVG) */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      <span>Kembali</span>
    </button>
  );
};

export default BackButton;