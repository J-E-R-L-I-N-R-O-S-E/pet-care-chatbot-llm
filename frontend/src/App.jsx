import Auth from "./Auth";
import { useState, useRef, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [dots, setDots] = useState("");
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");

  const [chats, setChats] = useState([
    { id: Date.now(), name: "Chat 1", messages: [] }
  ]);

  const [currentChatId, setCurrentChatId] = useState(chats[0].id);

  const chatEndRef = useRef(null);

  const currentChat =
    chats.find((chat) => chat.id === currentChatId) || { messages: [] };

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, typing]);

  // Typing animation
  useEffect(() => {
    if (!typing) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, [typing]);

  const sendMessage = async () => {
  if (!message.trim()) return;

  const cleanMessage = message.trim().toLowerCase();

  const userMsg = {
    sender: "user",
    text: cleanMessage,
    time: new Date().toLocaleTimeString()
  };

  setChats((prev) =>
  prev.map((chat) => {
    if (chat.id === currentChatId) {
      const isFirstMessage = chat.messages.length === 0;

      return {
        ...chat,
        name: isFirstMessage
          ? cleanMessage
              .split(" ")
              .slice(0, 2)
              .join(" ")
              .replace(/\b\w/g, (c) => c.toUpperCase())
          : chat.name,
        messages: [...chat.messages, userMsg]
      };
    }
    return chat;
  })
);
  setTyping(true);

  try {
    const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "";

const res = await fetch(`${BASE_URL}/chat`, { // ✅ FIXED
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: cleanMessage })
    });

    const data = await res.json();

    const botMsg = {
      sender: "bot",
      text: data.reply,
      time: new Date().toLocaleTimeString()
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, botMsg] }
          : chat
      )
    );

  } catch (error) {
    console.error("Chat error:", error);
    alert("Backend not responding ❌");
  }

  setTyping(false); // ✅ important
  setMessage("");
};

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      name: `Chat ${chats.length + 1}`,
      messages: []
    };

    setChats((prev) => [...prev, newChat]);
    setCurrentChatId(newChat.id);
  };

  const deleteChat = (id) => {
    const updated = chats.filter((chat) => chat.id !== id);
    setChats(updated.length ? updated : [{ id: Date.now(), name: "Chat 1", messages: [] }]);
    if (id === currentChatId && updated.length) {
      setCurrentChatId(updated[0].id);
    }
  };

  const renameChat = (id) => {
    const newName = prompt("Enter chat name:");
    if (!newName) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, name: newName } : chat
      )
    );
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  const theme = {
    bg: dark ? "#121212" : "#fff8e1",
    sidebar: dark ? "#1e1e1e" : "#4e342e"
  };

  if (!user) {
    return <Auth setUser={setUser} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: theme.bg }}>

      {/* Sidebar */}
      <div
        style={{
          width: "260px",
          background: theme.sidebar,
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>🐾 PetBot</h2>

        <button
          onClick={createNewChat}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            background: "#f57c00",
            color: "white",
            cursor: "pointer",
            width: "100%"
          }}
        >
          + New Chat
        </button>

        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            width: "100%",
            cursor: "pointer"
          }}
        />

        <button
          onClick={() => setDark(!dark)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer"
          }}
        >
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>

        <div style={{ marginTop: "10px", flex: 1, overflowY: "auto" }}>
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              style={{
                padding: "8px",
                borderRadius: "6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                width: "100%"
              }}
            >
              <span onClick={() => setCurrentChatId(chat.id)}>
                {chat.name}
              </span>

              <div style={{ display: "flex", gap: "6px" }}>
                <span onClick={() => renameChat(chat.id)}>✏️</span>
                <span onClick={() => deleteChat(chat.id)}>🗑️</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto"
          }}
        >
          {currentChat.messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent:
                  msg.sender === "user" ? "flex-end" : "flex-start",
                marginBottom: "10px"
              }}
            >
              <div
                style={{
                  background:
                    msg.sender === "user" ? "#ff9800" : "#ffffff",
                  color: msg.sender === "user" ? "white" : "black",
                  padding: "10px 14px",
                  borderRadius: "15px",
                  maxWidth: "60%"
                }}
              >
                {msg.text}
                <div style={{ fontSize: "10px", marginTop: "4px" }}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {typing && <div>🤖 typing{dots}</div>}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            display: "flex",
            padding: "10px",
            borderTop: "1px solid #ddd",
            background: "white"
          }}
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about pets..."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "20px",
              border: "1px solid #ccc"
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              marginLeft: "10px",
              padding: "10px 15px",
              borderRadius: "20px",
              border: "none",
              background: "#f57c00",
              color: "white",
              cursor: "pointer"
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;