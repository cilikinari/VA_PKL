import React from "react";
import { useNavigate } from "react-router-dom";
import "../ui/HomeScreen.css";

const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="homescreen">
      {/* =========================================
          HEADER / NAVBAR
      ========================================= */}
      <header className="homescreen__navbar">
        <div className="homescreen__logo">Virtual Assistant</div>
        <button
          className="homescreen__btn-login"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </header>

      {/* =========================================
          HERO SECTION (Halaman Atas)
      ========================================= */}
      <main className="homescreen__hero">
        <div className="homescreen__content">
          <h1 className="homescreen__title">
            Your Friendly <br />
            Virtual <br />
            Asisstant
          </h1>
          <p className="homescreen__description">
            Layanan Virtual Assistant untuk membantu menjawab pertanyaan
            mengenai layanan Statistik Pemerintahan Kota Denpasar secara
            otomatis.
          </p>
          <button
            className="homescreen__btn-start"
            onClick={() => navigate("/chat")}
          >
            Mulai bertanya
          </button>
        </div>
      </main>

      {/* =========================================
          ABOUT SECTION (Penjelasan & Preview UI)
      ========================================= */}
      <section className="homescreen__about">
        {/* Sisi Kiri: Teks Penjelasan */}
        <div className="about__text-side">
          <h2 className="about__title">Apa itu Virtual Assistant?</h2>
          <p className="about__description">
            Ini adalah layanan cerdas yang dirancang untuk mempermudah Anda
            dalam mencari informasi seputar layanan statistik di lingkungan
            Pemerintahan Kota Denpasar.
          </p>
          <p className="about__description">
            Mulai dari informasi sistem <strong>ROMANTIK</strong>, panduan
            penggunaan <strong>DOTA</strong>, hingga rekomendasi kegiatan
            statistik sektoral, semuanya bisa Anda tanyakan langsung dan akan
            dijawab secara <i>real-time</i>.
          </p>
        </div>

        {/* Sisi Kanan: Preview Mockup Chatbot */}
        <div className="about__preview-side">
          <div className="chat-mockup">
            <div className="chat-mockup__header">
              <div className="chat-mockup__avatar"></div>
              <span className="chat-mockup__name">Virtual Assistant</span>
            </div>

            <div className="chat-mockup__body">
              <div className="chat-mockup__bubble">
                Hi i'm your virtual asisstant, how can i help you today?
              </div>
              <div className="chat-mockup__options-box">
                <button className="chat-mockup__option-btn">
                  Apa itu ROMANTIK?
                </button>
                <button className="chat-mockup__option-btn">
                  Apa itu rekomendasi kegiatan statistik sektoral?
                </button>
                <button className="chat-mockup__option-btn">
                  Apa itu DOTA?
                </button>
                <button className="chat-mockup__option-btn">
                  Bagaimana cara membuat akun di DOTA?
                </button>
              </div>
            </div>

            <div className="chat-mockup__footer">
              <div className="chat-mockup__input-bar">
                <span className="chat-mockup__placeholder">
                  Type a message.....
                </span>
              </div>
              <button className="chat-mockup__send-btn">
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  width="20px"
                  height="20px"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* =========================================
          CTA SECTION (Pre-Footer)
      ========================================= */}
      <section className="homescreen__cta">
        <div className="cta__container">
          <h2 className="cta__title">Siap untuk Memulai?</h2>
          <p className="cta__description">
            Dapatkan jawaban cepat untuk berbagai kebutuhan data dan panduan
            layanan statistik sektoral Kota Denpasar tanpa harus menunggu lama.
          </p>
          <button className="cta__btn" onClick={() => navigate("/chat")}>
            Mulai Chat Sekarang
          </button>
        </div>
      </section>

      {/* =========================================
          FOOTER SECTION (Informasi & Kontak)
      ========================================= */}
      <footer className="homescreen__footer">
        <div className="footer__top">
          {/* Sisi Kiri: Deskripsi Singkat */}
          <div className="footer__description">
            <h3 className="footer__heading">TENTANG KAMI</h3>
            <p className="footer__desc-text">
              Virtual Assistant Statistik Pemerintahan Kota Denpasar hadir untuk
              memberikan kemudahan akses informasi seputar data statistik
              sektoral, layanan ROMANTIK, dan panduan DOTA secara cepat, tepat,
              dan otomatis bagi seluruh masyarakat serta instansi pemerintah.
            </p>
          </div>

          {/* Sisi Kanan: Kontak / Lokasi */}
          <div className="footer__contact-info">
            <h3 className="footer__heading">HUBUNGI KAMI</h3>
            <ul className="footer__list">
              <li>
                <span className="footer__icon">📍</span>
                <p>
                  Jl. Raya Puputan No. 1, Dangin Puri Klod, Kec. Denpasar Tim.,
                  Kota Denpasar, Bali
                </p>
              </li>
              <li>
                <span className="footer__icon">✉️</span>
                <p>bps5171@bps.go.id</p>
              </li>
              <li>
                <span className="footer__icon">📞</span>
                <p>Telp (0361) 222731</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Garis Pembatas */}
        <div className="footer__divider"></div>

        {/* Sisi Bawah: Copyright & Social Media */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © Badan Pusat Statistik Kota Denpasar — 2026
          </p>
          <div className="footer__socials">
            <a href="#" className="social-icon">
              YT
            </a>
            <a href="#" className="social-icon">
              IG
            </a>
            <a href="#" className="social-icon">
              FB
            </a>
            <a href="#" className="social-icon">
              TW
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;
