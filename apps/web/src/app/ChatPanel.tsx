"use client";

import { useState, useRef, useEffect } from "react";
import { createSession, sendMessage, subscribeToStream } from "../features/chat/api";
import { useChatStore, generateId } from "../features/chat/store";

export default function ChatPanel() {
  const [state, dispatch] = useChatStore();
  const [input, setInput] = useState("");
  const esRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.streamingToken]);

  useEffect(() => {
    return () => {
      esRef.current?.close();
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || state.isStreaming) return;

    let sessionId = state.sessionId;
    if (!sessionId) {
      const session = await createSession();
      sessionId = session.id;
      dispatch({ type: "SET_SESSION", sessionId });

      const es = subscribeToStream(sessionId, (data, eventType) => {
        const parsed = JSON.parse(data) as Record<string, unknown>;
        const payload = parsed["payload"] as Record<string, unknown>;
        switch (eventType) {
          case "agent.protocol.token_delta":
            dispatch({ type: "TOKEN_DELTA", delta: payload["delta"] as string });
            break;
          case "agent.protocol.tool_call_started":
            dispatch({
              type: "TOOL_STARTED",
              toolName: payload["toolName"] as string,
              input: payload["input"],
            });
            break;
          case "agent.protocol.tool_call_completed":
            dispatch({
              type: "TOOL_COMPLETED",
              toolName: payload["toolName"] as string,
              output: payload["output"],
            });
            break;
          case "agent.protocol.step_completed":
            dispatch({ type: "STREAM_END" });
            break;
        }
      });
      esRef.current = es;
    }

    const userMsg = {
      id: generateId(),
      role: "user" as const,
      content: input.trim(),
    };
    dispatch({ type: "ADD_MESSAGE", message: userMsg });
    setInput("");

    await sendMessage(sessionId, input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Zero Agent</h1>
      </header>

      <div style={styles.messages}>
        {state.messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.message,
              ...(msg.role === "user" ? styles.userMsg : styles.assistantMsg),
            }}
          >
            <div style={styles.messageRole}>{msg.role}</div>
            <div style={styles.messageContent}>{msg.content}</div>
          </div>
        ))}

        {state.currentTools.length > 0 && (
          <div style={styles.toolCalls}>
            {state.currentTools.map((tc, i) => (
              <div key={i} style={styles.toolCall}>
                <span style={styles.toolIcon}>
                  {tc.status === "running" ? "⏳" : "✅"}
                </span>
                <span style={styles.toolName}>{tc.toolName}</span>
              </div>
            ))}
          </div>
        )}

        {state.streamingToken && (
          <div style={{ ...styles.message, ...styles.assistantMsg }}>
            <div style={styles.messageRole}>assistant</div>
            <div style={styles.messageContent}>{state.streamingToken}</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputArea}>
        <textarea
          style={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={state.isStreaming}
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: !input.trim() || state.isStreaming ? 0.5 : 1,
          }}
          onClick={() => void handleSend()}
          disabled={!input.trim() || state.isStreaming}
        >
          Send
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    maxWidth: 800,
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    margin: 0,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  message: {
    padding: "12px 16px",
    borderRadius: 12,
    maxWidth: "80%",
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#3b82f6",
    color: "#fff",
  },
  assistantMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    color: "#111",
  },
  messageRole: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    opacity: 0.7,
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  toolCalls: {
    display: "flex",
    gap: 8,
    padding: "4px 0",
    flexWrap: "wrap",
  },
  toolCall: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    fontSize: 12,
  },
  toolIcon: {
    fontSize: 12,
  },
  toolName: {
    fontWeight: 500,
  },
  inputArea: {
    display: "flex",
    gap: 8,
    padding: 16,
    borderTop: "1px solid #e5e7eb",
  },
  textarea: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    resize: "none" as const,
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    padding: "10px 20px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
};
