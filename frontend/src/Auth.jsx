import { useState } from "react";

function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ✅ SMART BASE URL (IMPORTANT)
  const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5001"
    : "";

  const handleSubmit = async () => {
    const endpoint = isLogin ? "login" : "signup";

    try {
      const res = await fetch(`${BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      alert(data.message);

      if (endpoint === "login" && data.user) {
        setUser(data.user);
      }

    } catch (error) {
      console.error(error);
      alert("Server not responding ❌");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff8e1"
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          width: "300px",
          textAlign: "center",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
        }}
      >
        <h2>{isLogin ? "Login" : "Signup"}</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "8px",
            border: "1px solid #ccc"
          }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "8px",
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "10px",
            background: "#f57c00",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          {isLogin ? "Login" : "Signup"}
        </button>

        <p
          onClick={() => setIsLogin(!isLogin)}
          style={{ marginTop: "10px", cursor: "pointer", color: "#555" }}
        >
          {isLogin ? "Create account" : "Already have account?"}
        </p>
      </div>
    </div>
  );
}

export default Auth;