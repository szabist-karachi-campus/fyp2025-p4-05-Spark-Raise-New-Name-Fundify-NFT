import React, { useRef, useEffect, useState } from "react";

const ChatWindow = ({
  messages,
  onSend,
  currentUser,
  chatUser,
  chatUserLabel,
}) => {
  const [msg, setMsg] = useState("");
  const messagesEndRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
    if (!isAtBottom) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  }, [messages]);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
    setShowScrollButton(!isAtBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  const getUsername = (wallet) => {
    const users = JSON.parse(localStorage.getItem('chatUsers') || '{}');
    return users[wallet] || wallet;
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-[#23272F] bg-white dark:bg-[#181A20]">
        <div className="w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-500 flex items-center justify-center text-gray-800 dark:text-white text-lg">
          {chatUserLabel?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{chatUserLabel}</div>
        </div>
      </div>
      <div
        className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-[#23272F] relative"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === currentUser ? "justify-end" : "justify-start"} mb-2`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-xs
                ${m.sender === currentUser
                  ? "bg-blue-500 text-white dark:bg-blue-600 dark:text-white"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
                }`}
            >
              <div className="text-sm">{m.message}</div>
              <div className={`text-xs text-right mt-1 ${m.sender === currentUser ? 'text-blue-100 dark:text-blue-200' : 'text-gray-500 dark:text-gray-300'}`}> 
                {getUsername(m.sender) !== m.sender ? getUsername(m.sender) : ''} | {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {showScrollButton && (
          <button
            className="fixed bottom-24 right-10 bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50"
            onClick={scrollToBottom}
          >
            Scroll to bottom
          </button>
        )}
      </div>
      <form
        className="flex p-4 border-t border-gray-200 dark:border-[#23272F] bg-white dark:bg-[#181A20]"
        onSubmit={(e) => {
          e.preventDefault();
          if (msg.trim()) {
            onSend(msg.trim());
            setMsg("");
          }
        }}
      >
        <input
          className="flex-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#23272F] text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
          placeholder="Message"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          name="chatMessage"
        />
        <button
          className="ml-2 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow; 