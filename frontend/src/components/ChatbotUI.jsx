import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendMessage } from '../services/apiService';

function ChatbotUI() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: "bot" }
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      sender: "user"
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput("");
    setIsLoading(true);

    try {
      const botResponse = await sendMessage(userMessage.text);
      
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot"
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        sender: "bot",
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <h2>Growth With Flow Chatbot</h2>
      </div>
      
      <div className="message-area">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}-message`}>
            <span className={`message-text ${message.isError ? 'error-message' : ''}`}>
              {message.sender === 'bot' ? (
                <ReactMarkdown>{message.text}</ReactMarkdown>
              ) : (
                message.text
              )}
            </span>
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot-message">
            <span className="message-text loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="input-area" onSubmit={handleSubmit}>
        <input 
          type="text" 
          className="message-input"
          placeholder="Type your message here..."
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={isLoading || !currentInput.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatbotUI;