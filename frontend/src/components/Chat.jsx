import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { motion } from 'framer-motion';

const Chat = ({ roomId, currentUser }) => {
  const { messages, error, joinRoom, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    joinRoom(roomId);
  }, [roomId, joinRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && currentUser) {
      sendMessage(newMessage.trim(), currentUser);
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-100 dark:bg-[#23272F] rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="bg-blue-500 text-white dark:bg-blue-600 p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">Chat Room: {roomId}</h2>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3
                ${message.sender === currentUser
                  ? 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white'
                  : 'bg-gray-200 text-gray-800 dark:bg-[#23272F] dark:text-gray-200'
                }`}
            >
              <div className="font-semibold text-sm mb-1">
                {message.sender === currentUser ? 'You' : message.sender}
              </div>
              <div className="text-sm">{message.message}</div>
              <div className={`text-xs mt-1 ${
                message.sender === currentUser ? 'text-blue-100 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23272F] rounded-b-lg">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-[#181A20] text-gray-900 dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat; 