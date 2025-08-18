import React from "react";

const ChatList = ({
  chats,
  selectedChat,
  onSelectChat,
  onAddChat,
  search,
  setSearch,
  currentUser,
}) => (
  <div className="w-80 bg-gray-50 dark:bg-[#181A20] h-full flex flex-col border-r border-gray-200 dark:border-[#23272F]">
    <div className="p-4 flex gap-2">
      <input
        className="flex-1 p-2 rounded bg-white dark:bg-[#23272F] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
        placeholder="Search chat label..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        name="chatSearch"
      />
      <button
        className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700"
        onClick={onAddChat}
      >
        + Add chat
      </button>
    </div>
    <div className="flex-1 overflow-y-auto">
      {chats
        .filter((room) =>
          room.label.toLowerCase().includes(search.toLowerCase())
        )
        .map((room) => {
          const otherUser = room.users.find(u => u !== currentUser);
          return (
            <div
              key={room.chatRoomId}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#23272F] ${
                selectedChat === room.chatRoomId ? "bg-gray-100 dark:bg-[#23272F]" : ""
              }`}
              onClick={() => onSelectChat(room.chatRoomId)}
            >
              <div className="w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-500 flex items-center justify-center text-gray-800 dark:text-white text-lg">
                {room.label[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{room.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{otherUser}</div>
              </div>
            </div>
          );
        })}
    </div>
  </div>
);

export default ChatList; 