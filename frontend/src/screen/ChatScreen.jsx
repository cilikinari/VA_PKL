import React, { useState, useRef, useEffect } from "react";
import "../ui/ChatScreen.css";
import SendIcon from "@mui/icons-material/Send";

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [quickQuestions, setQuickQuestions] = useState([]);
  const [showQuickChat, setShowQuickChat] = useState(false);

  // STATE BARU: Untuk melacak status bot sedang mengetik
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      setMessages([
        {
          id: 1,
          sender: "assistant",
          text: "Hi i'm your virtual asisstant, how can i help you today?",
        },
      ]);
      fetchQuestionsFromAPI();
    }, 1000);

    return () => clearTimeout(initTimer);
  }, []);

  const fetchQuestionsFromAPI = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/faq/recommendations",
      );
      const result = await response.json();

      if (result.status === "success") {
        const limitedQuestions = result.data.slice(0, 5);
        setQuickQuestions(limitedQuestions);
        setShowQuickChat(true);
      } else {
        console.error("Gagal mengambil data FAQ:", result.message);
      }
    } catch (error) {
      console.error("Gagal menghubungkan ke server API:", error);
    }
  };

  const fetchAnswerFromAPI = async (payload) => {
    // 1. Munculkan animasi mengetik sebelum memanggil API
    setIsTyping(true);

    try {
      // NOTE: Pastikan URL ini sesuai dengan route di backend kamu ya!
      // Kalau sebelumnya '/api/faq/answer', ganti lagi ke situ.
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // 2. TAMBAHKAN SETTIMEOUT DI SINI (Simulasi Bot Mengetik selama 1.5 detik)
      setTimeout(() => {
        if (result.status === "success" || result.status === "not_found") {
          const newBotMessage = {
            id: Date.now(),
            sender: "assistant",
            text: result.data.jawaban,
          };
          setMessages((prev) => [...prev, newBotMessage]);
        } else {
          console.error("Gagal mendapatkan jawaban:", result.message);
        }
        
        // 3. Matikan animasi mengetik SETELAH jeda waktu selesai
        setIsTyping(false);
      }, 1000); // 1500 milidetik = 1,5 detik

    } catch (error) {
      console.error("Gagal menghubungkan ke server API:", error);
      
      // Kasih jeda juga di bagian error agar tetap terlihat natural
      setTimeout(() => {
        const errorBotMessage = {
          id: Date.now(),
          sender: "assistant",
          text: "Maaf, sistem sedang gangguan. Coba lagi nanti ya.",
        };
        setMessages((prev) => [...prev, errorBotMessage]);
        
        setIsTyping(false);
      }, 1500);
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showQuickChat, isTyping]); // Tambahkan isTyping agar scroll ke bawah saat titik-titik muncul

  const handleQuickChatClick = (id, questionText) => {
    setShowQuickChat(false);
    const newUserMessage = {
      id: Date.now(),
      sender: "user",
      text: questionText,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    fetchAnswerFromAPI({ id: id });
  };

  const handleSendManual = () => {
    if (inputText.trim() === "") return;

    setShowQuickChat(false);
    const textToSend = inputText;
    const newUserMessage = { id: Date.now(), sender: "user", text: textToSend };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");

    fetchAnswerFromAPI({ text: textToSend });
  };

  return (
    <div className="chat-container">
      {/* HEADER */}
      <div className="chat-header">
        <div className="header-avatar"></div>
        <h2 className="header-title">Virtual Asisstant</h2>
      </div>

      {/* AREA CHAT UTAMA */}
      <div className="chat-body">
        {/* Render Riwayat Pesan */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-row ${msg.sender === "user" ? "row-user" : "row-assistant"}`}
          >
            <div
              className={`message-bubble ${msg.sender === "user" ? "bubble-user" : "bubble-assistant"}`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}

        {/* UI BARU: Indikator Typing (Muncul kalau isTyping === true) */}
        {isTyping && (
          <div className="message-row row-assistant">
            <div className="message-bubble bubble-assistant typing-bubble">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}

        {/* Render Kotak Quick Chat (FAQ) */}
        {showQuickChat && quickQuestions.length > 0 && !isTyping && (
          <div className="quick-chat-container">
            <div className="quick-chat-box">
              {quickQuestions.map((q) => (
                <button
                  key={q.id}
                  className="quick-chat-btn"
                  onClick={() => handleQuickChatClick(q.id, q.pertanyaan)}
                >
                  {q.pertanyaan}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* AREA INPUT TEXT */}
      <div className="chat-footer">
        <div className="input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message....."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendManual()}
            disabled={isTyping} // Matikan input saat bot sedang memproses
          />
          <button
            className="send-btn"
            onClick={handleSendManual}
            disabled={!inputText.trim() || isTyping} // Matikan tombol kirim saat memproses
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;