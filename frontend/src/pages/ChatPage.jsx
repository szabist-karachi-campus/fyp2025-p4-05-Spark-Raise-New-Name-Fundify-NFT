import React, { useState, useEffect, useRef } from "react";
import ChatModal from "../components/ChatModal";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import { useChat } from "../contexts/ChatContext";

// Always get the latest wallet address
const getCurrentWallet = () => window.ethereum?.selectedAddress || "User123";

const ChatPageContent = () => {
  const [currentUser, setCurrentUser] = useState(getCurrentWallet());
  const [selectedChat, setSelectedChat] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [chatUser, setChatUser] = useState(null); // The other user's wallet address
  const lastWalletRef = useRef(currentUser);

  const {
    messages,
    joinRoom,
    sendMessage,
    chatRooms,
    fetchChatRooms,
    createChatRoom,
    loadingRooms,
    error,
  } = useChat();

  // Listen for wallet/account changes and reload the page
  useEffect(() => {
    if (window.ethereum) {
      const handler = () => {
        window.location.reload();
      };
      window.ethereum.on('accountsChanged', handler);
      return () => {
        window.ethereum.removeListener('accountsChanged', handler);
      };
    }
  }, []);

  // Only update currentUser if wallet actually changes
  useEffect(() => {
    const interval = setInterval(() => {
      const latest = getCurrentWallet();
      if (latest !== lastWalletRef.current) {
        lastWalletRef.current = latest;
        setCurrentUser(latest);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch chat rooms for the current wallet
  useEffect(() => {
    if (!currentUser) return;
    fetchChatRooms(currentUser);
    setSelectedChat(null);
    setChatUser(null);
    // Only depend on currentUser to avoid repeated fetching
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // When chatRooms change, select the first chat by default
  useEffect(() => {
    if (chatRooms.length > 0 && !selectedChat) {
      setSelectedChat(chatRooms[0].chatRoomId);
      setChatUser(chatRooms[0].users.find(u => u !== currentUser));
      joinRoom(chatRooms[0].chatRoomId);
    }
  }, [chatRooms, selectedChat, currentUser, joinRoom]);

  // When selecting a chat, join its room and set the other user
  const handleSelectChat = (chatRoomId) => {
    setSelectedChat(chatRoomId);
    const room = chatRooms.find(r => r.chatRoomId === chatRoomId);
    setChatUser(room ? room.users.find(u => u !== currentUser) : null);
    joinRoom(chatRoomId);
  };

  // When creating a new chat
  const handleCreateChat = async ({ label, walletB }) => {
    const walletA = currentUser;
    const createdBy = currentUser;
    const chatRoomId = await createChatRoom({ label, walletA, walletB, createdBy });
    if (chatRoomId) {
      setSelectedChat(chatRoomId);
      setChatUser(walletB);
      joinRoom(chatRoomId);
    }
  };

  return (
    <div className="h-screen w-full bg-[#f5eded] dark:bg-[#13131a] flex items-center justify-center">
      <div className="min-h-screen flex h-[90vh] bg-[#F5EDED] dark:bg-[#23272F] rounded-lg overflow-hidden w-full max-w-6xl">
        <div className="flex flex-col bg-gray-50 dark:bg-[#181A20] border-r border-gray-200 dark:border-[#23272F] p-4 rounded-l-lg min-w-[22rem]">
          <button
            className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded mb-4 self-start shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={() => fetchChatRooms(currentUser.toLowerCase())}
            title="Refresh chat rooms"
          >
            Refresh
          </button>
          <ChatList
            chats={chatRooms}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            onAddChat={() => setModalOpen(true)}
            search={search}
            setSearch={setSearch}
            currentUser={currentUser.toLowerCase()}
          />
        </div>
        <div className="flex-1 flex flex-col">
          {selectedChat && chatUser ? (
            (() => {
              const room = chatRooms.find(r => r.chatRoomId === selectedChat);
              return (
            <ChatWindow
                  key={selectedChat}
              messages={messages}
                  onSend={(msg) => sendMessage(msg, currentUser.toLowerCase(), chatUser.toLowerCase())}
                  currentUser={currentUser.toLowerCase()}
                  chatUser={chatUser.toLowerCase()}
                  chatUserLabel={room?.label || chatUser}
            />
              );
            })()
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a chat to start messaging
            </div>
          )}
        </div>
        <ChatModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateChat}
        />
      </div>
    </div>
  );
};

const ChatPage = () => {
  return <ChatPageContent />;
};

export default ChatPage;