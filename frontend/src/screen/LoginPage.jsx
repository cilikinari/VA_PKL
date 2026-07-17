import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../ui/LoginPage.css";
import BackButton from "../widgets/BackButton";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        setErrorMessage(
          result.message ||
            "Login gagal. Periksa kembali username dan password.",
        );
        setIsLoading(false);
        return;
      }

      localStorage.setItem("adminToken", result.data.token);
      localStorage.setItem("adminUsername", result.data.username);
      navigate("/admin");
    } catch (error) {
      setErrorMessage("Tidak bisa terhubung ke server admin. Coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__back-wrap">
        <BackButton fallbackTo="/" label="Kembali" />
      </div>
      <div className="login-page__card">
        <div className="login-page__header">
          <h1 className="login-page__title">Login</h1>
        </div>

        <form className="login-page__form" onSubmit={handleSubmit}>
          <div className="login-page__field">
            <label htmlFor="username">Nama pengguna</label>
            <input
              id="username"
              type="text"
              placeholder="Masukkan nama pengguna"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div className="login-page__field">
            <label htmlFor="password">Kata sandi</label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan kata sandi"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {errorMessage ? (
            <p className="login-page__error">{errorMessage}</p>
          ) : null}

          <button
            type="submit"
            className="login-page__submit"
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
