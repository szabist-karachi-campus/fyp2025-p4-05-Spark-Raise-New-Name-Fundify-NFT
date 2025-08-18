import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSocket } from "../utils/socket";
import axios from "axios";

const ChatContext = createContext();

export const ChatProvider = ({ children, currentWallet }) => {
  const [messages, setMessages] = useState([]);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState(null);
  const [wallet, setWallet] = useState((currentWallet || "").toLowerCase());

  useEffect(() => {
    if (currentWallet && currentWallet.toLowerCase() !== wallet) {
      setWallet(currentWallet.toLowerCase());
    }
  }, [currentWallet]);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    s.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    s.on("chatHistory", (msgs) => {
      setMessages(msgs);
    });

    return () => {
      s.off("receiveMessage");
      s.off("chatHistory");
    };
  }, []);

  // Fetch chat rooms for the connected wallet
  const fetchChatRooms = useCallback(async (walletArg) => {
    const walletToUse = (walletArg || wallet).toLowerCase();
    console.log("[ChatContext] Fetching chat rooms for wallet:", walletToUse);
    setLoadingRooms(true);
    try {
      const res = await axios.get(`/api/chat/rooms/${walletToUse}`);
      setChatRooms(res.data.chats || []);
    } catch (err) {
      setError("Failed to fetch chat rooms");
    } finally {
      setLoadingRooms(false);
    }
  }, [wallet]);

  // Create a chat room
  const createChatRoom = async ({ label, walletA, walletB, createdBy }) => {
    try {
      const res = await axios.post("/api/chat/create", {
        label,
        walletA: walletA.toLowerCase(),
        walletB: walletB.toLowerCase(),
        createdBy: createdBy.toLowerCase(),
      });
      // Optionally refetch chat rooms
      await fetchChatRooms(createdBy.toLowerCase());
      return res.data.chatRoomId;
    } catch (err) {
      setError("Failed to create chat room");
      return null;
    }
  };

  const joinRoom = (roomId) => {
    setChatRoomId(roomId);
    socket?.emit("joinRoom", roomId);
  };

  // Send a message
  const sendMessage = (message, sender, receiver) => {
    if (!chatRoomId) return;
    socket.emit("sendMessage", {
      chatRoomId,
      sender: sender.toLowerCase(),
      receiver: receiver.toLowerCase(),
      message
    });
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        joinRoom,
        sendMessage,
        chatRooms,
        fetchChatRooms,
        createChatRoom,
        loadingRooms,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext); 