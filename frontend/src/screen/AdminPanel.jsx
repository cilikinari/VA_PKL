import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../ui/AdminPanel.css";
import FaqCrudWidget from "../widgets/FaqCrudWidget";

const AdminPanel = () => {
  const navigate = useNavigate();
  const adminUsername = localStorage.getItem("adminUsername") || "Admin";

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    navigate("/");
  };

  return (
    <div className="admin-panel">
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
  );
};

export default AdminPanel;
