function ChatInput({
  currentInput,
  setCurrentInput,
  onSubmit,
  isLoading,
  onKeyPress,
}) {
  return (
    <form className="input-area" onSubmit={onSubmit}>
      <div className="input-container">
        <textarea
          className="message-input"
          placeholder="Type your message here..."
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={onKeyPress}
          disabled={isLoading}
          rows="1"
        />
        <button
          type="submit"
          className="send-button"
          disabled={isLoading || !currentInput.trim()}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </form>
  );
}

export default ChatInput;
