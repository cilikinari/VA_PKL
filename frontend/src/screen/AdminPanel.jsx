import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../ui/AdminPanel.css";

const AdminPanel = () => {
  const navigate = useNavigate();
  const adminUsername = localStorage.getItem("adminUsername") || "Admin";

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    navigate("/login");
  };

  return (
    <div className="admin-panel">
      <header className="admin-panel__topbar">
        <div>
          <p className="admin-panel__eyebrow">Admin Panel</p>
          <h1 className="admin-panel__title">
            Selamat datang, {adminUsername}
          </h1>
        </div>
        <button className="admin-panel__logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="admin-panel__content">
        <section className="admin-panel__hero">
          <div>
            <p className="admin-panel__label">Ringkasan cepat</p>
            <h2>Dashboard dummy untuk admin</h2>
            <p>
              Login sudah terhubung ke backend admin. Sementara ini panel ini
              hanya dummy, tapi token dan sesi login sudah tersimpan.
            </p>
          </div>
        </section>

        <section className="admin-panel__stats">
          <div className="admin-panel__card">
            <span>FAQ aktif</span>
            <strong>24</strong>
          </div>
          <div className="admin-panel__card">
            <span>Pesan masuk</span>
            <strong>128</strong>
          </div>
          <div className="admin-panel__card">
            <span>Admin online</span>
            <strong>1</strong>
          </div>
        </section>

        <section className="admin-panel__table">
          <h3>Aktivitas terakhir</h3>
          <div className="admin-panel__table-box">
            <div className="admin-panel__table-row admin-panel__table-row--head">
              <span>Waktu</span>
              <span>Aktivitas</span>
              <span>Status</span>
            </div>
            <div className="admin-panel__table-row">
              <span>09:15</span>
              <span>Menambah FAQ baru</span>
              <span>Selesai</span>
            </div>
            <div className="admin-panel__table-row">
              <span>10:20</span>
              <span>Meninjau pertanyaan pengguna</span>
              <span>Berjalan</span>
            </div>
            <div className="admin-panel__table-row">
              <span>11:05</span>
              <span>Update konten bantuan</span>
              <span>Menunggu</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPanel;
