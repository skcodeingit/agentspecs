import React, { useEffect, useRef, useState } from "react";

function App() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("🔴 Disconnected");
  const logContainerRef = useRef(null);

  useEffect(() => {
    const url = "http://localhost:8000/stream-logs";
    console.log("Connecting to:", url);

    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      console.log("✅ Connected to SSE stream");
      setStatus("🟢 Connected");
    };

    eventSource.onmessage = (event) => {
      try {
        console.log("Raw event:", event.data);
        const data = JSON.parse(event.data);
        setLogs((prev) => [...prev, data.line]);
      } catch (e) {
        console.error("JSON parse error:", e);
      }
    };

    eventSource.onerror = (err) => {
      console.error("❌ SSE error:", err);
      setStatus("🔴 Disconnected");
      // Do not close immediately to allow retries
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Scroll to bottom whenever logs update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem" }}>
      <h2>📜 Live Log Stream</h2>
      <p>{status}</p>

      <div
        ref={logContainerRef}
        style={{
          backgroundColor: "#111",
          color: "#0f0",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "10px",
          height: "400px",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: "#777" }}>Waiting for logs...</div>
        ) : (
          logs.map((line, index) => <div key={index}>{line}</div>)
        )}
      </div>
    </div>
  );
}

export default App;
