import ReactMarkdown from "react-markdown";

function MessageList({ messages, isLoading, messagesEndRef }) {
  return (
    <>
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.sender}-message`}>
          <span
            className={`message-text ${message.isError ? "error-message" : ""}`}
          >
            {message.sender === "bot" ? (
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
    </>
  );
}

export default MessageList;
