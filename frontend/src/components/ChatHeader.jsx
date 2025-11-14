function ChatHeader({ onNewChat }) {
  return (
    <header className="chat-header">
      <div className="header-content">
        <h1 className="header-title">Growth With Flow</h1>
        <button
          onClick={onNewChat}
          className="new-chat-btn"
          title="Start new conversation"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New chat
        </button>
      </div>
    </header>
  );
}

export default ChatHeader;
