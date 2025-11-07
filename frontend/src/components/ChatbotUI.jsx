function ChatbotUI() {
  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <h2>Growth With Flow Chatbot</h2>
      </div>
      
      <div className="message-area">
        <div className="message bot-message">
          <span className="message-text">Hello! How can I help you today?</span>
        </div>
      </div>
      
      <div className="input-area">
        <input 
          type="text" 
          className="message-input"
          placeholder="Type your message here..."
        />
        <button className="send-button">
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatbotUI;