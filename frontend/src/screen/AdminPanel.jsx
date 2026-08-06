import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../ui/AdminPanel.css";
import FaqCrudWidget from "../widgets/FaqCrudWidget";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const adminUsername = localStorage.getItem("adminUsername") || "Admin";

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    setIsLogoutOpen(true);
  };

  const handleCancelLogout = () => {
    setIsLogoutOpen(false);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    navigate("/login");
  };

  return (
    <div
      className={`admin-panel ${isLogoutOpen ? "admin-panel--modal-open" : ""}`}
    >
      <div
        className={`admin-panel__shell ${isLogoutOpen ? "admin-panel__shell--blurred" : ""}`}
      >
        <header className="admin-panel__topbar">
          <div className="admin-panel__brand">
            <div>
              <p className="admin-panel__eyebrow">Admin Panel</p>
              <h1 className="admin-panel__title">
                Selamat datang, {adminUsername}
              </h1>
            </div>
            <p className="admin-panel__subtitle">
              Kelola pertanyaan, jawaban, dan keyword bot dari satu tempat.
            </p>
          </div>

          <div className="admin-panel__topbar-actions">
            <button
              type="button"
              className="admin-panel__logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="admin-panel__content">
          <FaqCrudWidget />
        </main>
      </div>

      {isLogoutOpen ? (
        <div
          className="admin-panel__logout-modal"
          role="presentation"
          onClick={handleCancelLogout}
        >
          <div
            className="admin-panel__logout-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-panel__logout-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none">
                <path
                  d="M24 16H20C17.7909 16 16 17.7909 16 20V44C16 46.2091 17.7909 48 20 48H24"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M35 22L46 32M46 32L35 42M46 32H24"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 id="logout-title" className="admin-panel__logout-title">
              Lanjutkan Logout?
            </h2>
            <p className="admin-panel__logout-text">
              Anda bisa masuk kembali melalui halaman login untuk mengakses
              admin panel.
            </p>

            <div className="admin-panel__logout-actions">
              <button
                type="button"
                className="admin-panel__logout-button admin-panel__logout-button--danger"
                onClick={handleConfirmLogout}
              >
                Logout
              </button>
              <button
                type="button"
                className="admin-panel__logout-button admin-panel__logout-button--secondary"
                onClick={handleCancelLogout}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminPanel;
