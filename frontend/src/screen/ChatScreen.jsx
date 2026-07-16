import React, { useState, useRef, useEffect } from "react";
import "../ui/ChatScreen.css"; // Import file CSS di sini
import SendIcon from "@mui/icons-material/Send";

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [quickQuestions, setQuickQuestions] = useState([]);
  const [showQuickChat, setShowQuickChat] = useState(false);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showQuickChat]);

  const handleQuickChatClick = (questionText) => {
    setShowQuickChat(false);
    const newUserMessage = {
      id: Date.now(),
      sender: "user",
      text: questionText,
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // TODO: Panggil API endpoint untuk mencari jawaban
  };

  const handleSendManual = () => {
    if (inputText.trim() === "") return;

    setShowQuickChat(false);
    const newUserMessage = { id: Date.now(), sender: "user", text: inputText };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");

    // TODO: Panggil API endpoint untuk mencari jawaban
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

        {/* Render Kotak Quick Chat (FAQ) */}
        {showQuickChat && quickQuestions.length > 0 && (
          <div className="quick-chat-container">
            <div className="quick-chat-box">
              {quickQuestions.map((q) => (
                <button
                  key={q.id}
                  className="quick-chat-btn"
                  onClick={() => handleQuickChatClick(q.pertanyaan)}
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
          />
          <button
            className="send-btn"
            onClick={handleSendManual}
            disabled={!inputText.trim()}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
