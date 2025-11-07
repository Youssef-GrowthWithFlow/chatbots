import { useState, useEffect, useRef } from "react";
import { sendMessage } from "../services/apiService";
import { FLOW_IDS, getFlowDisplayName } from "../utils/flowConstants";
import ChatHeader from "./ChatHeader";
import WelcomeScreen from "./WelcomeScreen";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

function ChatbotUI() {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [flowId, setFlowId] = useState(FLOW_IDS.PRESENTATION);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
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
    setShowWelcome(false);

    try {
      const botResponse = await sendMessage(userMessage.text, flowId);

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        sender: "bot",
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
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

  const handleFlowSelection = (selectedFlowId, flowName) => {
    setFlowId(selectedFlowId);
    setShowWelcome(false);

    const systemMessage = {
      id: Date.now(),
      text: `You selected: ${flowName}. How can I help you?`,
      sender: "bot",
    };
    setMessages([systemMessage]);
  };

  const handleFlowSwitch = (newFlowId) => {
    if (newFlowId === flowId) return;

    setFlowId(newFlowId);
    setShowWelcome(false);

    const switchMessage = {
      id: Date.now(),
      text: `Switched to: ${getFlowDisplayName(newFlowId)}. How can I help you?`,
      sender: "bot",
    };
    setMessages([switchMessage]);
  };

  return (
    <div className="chatbot-container">
      <ChatHeader flowId={flowId} onFlowSwitch={handleFlowSwitch} />

      <div className="message-area">
        {showWelcome && messages.length === 0 && (
          <WelcomeScreen onFlowSelection={handleFlowSelection} />
        )}

        <MessageList
          messages={messages}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />
      </div>

      <ChatInput
        currentInput={currentInput}
        setCurrentInput={setCurrentInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
}

export default ChatbotUI;
