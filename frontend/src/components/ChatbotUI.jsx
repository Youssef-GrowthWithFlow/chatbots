import { useState, useEffect, useRef } from "react";
import { sendMessage, clearSession } from "../services/apiService";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import CVFlowManager from "./CVFlowManager";
import ResumeModal from "./resume/ResumeModal";

function ChatbotUI() {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCVFlow, setShowCVFlow] = useState(false);
  const [showDebugResume, setShowDebugResume] = useState(false); // DEBUG
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e, flowId = "PRESENTATION") => {
    e.preventDefault();

    if (!currentInput.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: currentInput.trim(),
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentInput("");
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage.text, flowId, null);

      if (response.type === "text" && response.data) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), text: response.data, sender: "bot" },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Désolé, j'ai un problème pour répondre. Veuillez réessayer.",
          sender: "bot",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleNewChat = () => {
    clearSession();
    setMessages([]);
    setCurrentInput("");
    setShowCVFlow(false);
  };

  const handleQuickAction = async (message, flowId = "PRESENTATION") => {
    if (flowId === "DYNAMIC_CV") {
      setShowCVFlow(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await sendMessage(message, flowId, null);

      if (response.type === "text" && response.data) {
        setMessages([
          { id: Date.now(), text: message, sender: "user" },
          { id: Date.now() + 1, text: response.data, sender: "bot" },
        ]);
      }
    } catch (error) {
      setMessages([
        {
          id: Date.now(),
          text: "Désolé, j'ai un problème pour répondre. Veuillez réessayer.",
          sender: "bot",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // If CV flow is active, show only CVFlowManager
  if (showCVFlow) {
    return (
      <div className="chatbot-container">
        <ChatHeader onNewChat={handleNewChat} />
        <div className="message-area">
          <CVFlowManager />
        </div>
      </div>
    );
  }

  // Normal chat interface
  return (
    <div className="chatbot-container">
      <ChatHeader onNewChat={handleNewChat} />

      <div className="message-area">
        {messages.length === 0 && !isLoading && (
          <div className="welcome-message">
            <div className="welcome-content">
              <h1>Comment puis-je vous aider ?</h1>
              <p>Posez-moi vos questions sur Growth With Flow</p>

              <div className="quick-actions">
                <button
                  className="quick-action-btn"
                  onClick={() =>
                    handleQuickAction(
                      "J'ai besoin d'une roadmap pour mon projet",
                      "ROADMAP",
                    )
                  }
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Obtenir une roadmap
                </button>

                <button
                  className="quick-action-btn"
                  onClick={() =>
                    handleQuickAction(
                      "Pouvez-vous me proposer une offre ?",
                      "PRESENTATION",
                    )
                  }
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Proposer une offre
                </button>

                <button
                  className="quick-action-btn"
                  onClick={() =>
                    handleQuickAction(
                      "Générer un CV personnalisé",
                      "DYNAMIC_CV",
                    )
                  }
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Générer un CV personnalisé
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="message-list">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>

      <ChatInput
        currentInput={currentInput}
        setCurrentInput={setCurrentInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onKeyPress={handleKeyPress}
      />

      {/* DEBUG: Button to show resume design */}
      <button
        onClick={() => setShowDebugResume(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px 20px",
          background: "#667eea",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "500",
          zIndex: 999,
        }}
      >
        🎨 View Resume Design
      </button>

      {/* DEBUG: Dummy Resume Modal */}
      {showDebugResume && (
        <ResumeModal
          resumeId="debug-dummy"
          onClose={() => setShowDebugResume(false)}
        />
      )}
    </div>
  );
}

export default ChatbotUI;
