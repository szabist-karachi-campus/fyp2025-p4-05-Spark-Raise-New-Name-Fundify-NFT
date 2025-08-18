import React, { useState } from "react";

const isValidWallet = (address) => {
  const trimmed = address.trim();
  if (trimmed.length !== 42) return "Wallet address must be exactly 42 characters.";
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return "Invalid wallet address. Must start with 0x and be 40 hex characters.";
  return "";
};
const isValidName = (name) => {
  // Only letters, at least 1 char
  return /^[A-Za-z]{1,}$/g.test(name);
};

const ChatModal = ({ isOpen, onClose, onCreate }) => {
  const [wallet, setWallet] = useState("");
  const [label, setLabel] = useState("");
  const [walletError, setWalletError] = useState("");
  const [labelError, setLabelError] = useState("");

  if (!isOpen) return null;

  const handleCreate = () => {
    let valid = true;
    const walletValidation = isValidWallet(wallet);
    if (walletValidation) {
      setWalletError(walletValidation);
      valid = false;
    } else {
      setWalletError("");
    }
    if (!isValidName(label)) {
      setLabelError("Name must only contain letters and no numbers.");
      valid = false;
    } else {
      setLabelError("");
    }
    if (!valid) return;
    onCreate({ label, walletB: wallet.trim() });
    setWallet("");
    setLabel("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-[#181A20] rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-semibold mb-4 text-white">Create chat</h2>
        <input
          type="text"
          className="w-full p-2 rounded bg-[#23272F] text-white mb-2"
          placeholder="Enter wallet address..."
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          name="walletAddress"
        />
        {walletError && <div className="text-red-400 text-sm mb-2">{walletError}</div>}
        <input
          type="text"
          className="w-full p-2 rounded bg-[#23272F] text-white mb-4"
          placeholder="Enter name..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          name="chatLabel"
        />
        {labelError && <div className="text-red-400 text-sm mb-2">{labelError}</div>}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-600 text-white"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={handleCreate}
            disabled={!wallet || !label}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal; 