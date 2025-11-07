function ChatInput({
  currentInput,
  setCurrentInput,
  onSubmit,
  isLoading,
  onKeyPress,
}) {
  return (
    <form className="input-area" onSubmit={onSubmit}>
      <input
        type="text"
        className="message-input"
        placeholder="Type your message here..."
        value={currentInput}
        onChange={(e) => setCurrentInput(e.target.value)}
        onKeyPress={onKeyPress}
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
  );
}

export default ChatInput;
