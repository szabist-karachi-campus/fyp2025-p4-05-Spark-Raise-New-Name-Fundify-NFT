import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { funn } from "../assets";
import { navlinks } from "../constants";
import { useStateContext } from "../context/StateContext";
import { FaComments } from 'react-icons/fa';
import { useTheme } from "../contexts/ThemeContext";

const Icon = ({ styles, name, imgUrl, SvgIcon, isActive, disabled, handleClick, theme }) => (
  <div
    className={`w-[48px] h-[48px] rounded-[12px] ${
      isActive && isActive === name && "bg-gradient-to-r from-[#8c6dfd] to-[#6a5acd]"
    } flex justify-center items-center ${
      !disabled && `cursor-pointer ${
        theme === 'light' 
          ? 'hover:bg-[#787A91] hover:bg-opacity-20' 
          : 'hover:bg-[#2c2f32]'
      } transition-all duration-200`
    } ${styles}`}
    onClick={handleClick}
  >
    {SvgIcon ? (
      <SvgIcon className={`w-1/2 h-1/2 ${isActive ? 'text-[#8c6dfd]' : 'grayscale text-gray-400'}`} />
    ) : (
      <img
        src={imgUrl}
        alt={name}
        className={`w-1/2 h-1/2 ${isActive ? '' : 'grayscale'}`}
      />
    )}
  </div>
);

const ThemeToggle = ({ theme, toggleTheme }) => (
  <div className="relative group">
    <button
      onClick={toggleTheme}
      className={`w-[48px] h-[48px] rounded-[12px] flex justify-center items-center cursor-pointer ${
        theme === 'light'
          ? 'hover:bg-[#787A91] hover:bg-opacity-20'
          : 'hover:bg-[#2c2f32]'
      } transition-all duration-200`}
    >
      {theme === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2B2B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
    <div className={`absolute left-[60px] top-1/2 transform -translate-y-1/2 ${
      theme === 'light'
        ? 'bg-[#F5EDED] text-[#2B2B2B] shadow-md'
        : 'bg-[#2c2f32] text-white'
    } text-sm px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
      {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    </div>
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, disconnect } = useStateContext();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      // Disconnect from MetaMask if available
      if (window.ethereum) {
        try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }]
        });
        } catch (e) { /* ignore if not supported */ }
        window.ethereum.removeAllListeners && window.ethereum.removeAllListeners();
      }
      // Use the context's disconnect function if available
      if (disconnect) await disconnect();
        // Clear any stored data
        localStorage.clear();
        sessionStorage.clear();
      // Always redirect to landing page
        window.location.href = '/';
    } catch (error) {
      console.error("Error during logout:", error);
      window.location.href = '/';
    }
  };

  const handleNavigation = (link) => {
    if (link.name === 'logout') {
      handleLogout();
    } else if (!link.disabled) {
      navigate(link.link);
    }
  };

  return (
    <div className={`flex flex-col justify-between items-center h-screen ${theme === 'light' ? 'bg-[#F5EDED]' : ''}`}>
      <div className="flex flex-col items-center w-full h-full justify-between">
        <Link to="/">
          <Icon
            styles={`md:w-[70px] md:h-[70px] sm:h-[18px] sm:w-[18px] ${
              theme === 'light'
                ? 'bg-[#F5EDED] hover:bg-[#787A91] hover:bg-opacity-20'
                : 'bg-[#1c1c24] hover:bg-[#2c2f32]'
            }`}
            imgUrl={funn}
            theme={theme}
          />
        </Link>
        <div className={`flex-1 flex flex-col justify-between items-center ${
          theme === 'light'
            ? 'bg-[#F5EDED] shadow-md border border-[#787A91]'
            : 'bg-[#1c1c24]'
        } rounded-[20px] md:w-[76px] w-[64px] py-8 mt-2 h-full`}>
          <div className="flex flex-col justify-start items-center gap-2">
            {/* Regular nav links excluding logout */}
            {navlinks.filter(link => link.name !== 'logout' && link.name !== 'profile').map((link) => (
              <div key={link.name} className="relative group">
                <Icon
                  styles={`md:h-[48px] sm:h-[36px] ${theme === 'light' ? 'bg-[#F5EDED]' : ''}`}
                  {...link}
                  isActive={location.pathname === link.link}
                  handleClick={() => handleNavigation(link)}
                  theme={theme}
                />
                <div className={`absolute left-[60px] top-1/2 transform -translate-y-1/2 ${
                  theme === 'light'
                    ? 'bg-[#F5EDED] text-[#2B2B2B] shadow-md'
                    : 'bg-[#2c2f32] text-white'
                } text-sm px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
                  {link.name}
                </div>
              </div>
            ))}
            {/* NFT Icons after profile */}
            {/* Create NFT Icon */}
            <div className="relative group">
              <Icon
                styles={`${
                  theme === 'light'
                    ? 'bg-[#F5EDED] hover:bg-[#787A91] hover:bg-opacity-20'
                    : 'bg-[#1c1c24] hover:bg-[#2c2f32]'
                } transition-all duration-200 md:h-[48px] sm:h-[36px]`}
                handleClick={() => navigate("/nft-form")}
                theme={theme}
                SvgIcon={({ className }) => (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={theme === 'light' ? '#787A91' : 'currentColor'} className={className}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4m12-4l4 4-4 4m-8-8L4 8l4-4" />
                  </svg>
                )}
                name="nft-form"
                isActive={location.pathname === "/nft-form"}
              />
              <div className={`absolute left-[60px] top-1/2 transform -translate-y-1/2 ${
                theme === 'light'
                  ? 'bg-[#F5EDED] text-[#2B2B2B] shadow-md'
                  : 'bg-[#2c2f32] text-white'
              } text-sm px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
                Create NFT
              </div>
            </div>
            {/* Explore NFT Icon */}
            <div className="relative group">
              <Icon
                styles={`${
                  theme === 'light'
                    ? 'bg-[#F5EDED] hover:bg-[#787A91] hover:bg-opacity-20'
                    : 'bg-[#1c1c24] hover:bg-[#2c2f32]'
                } transition-all duration-200 md:h-[48px] sm:h-[36px]`}
                handleClick={() => navigate("/nft-list")}
                theme={theme}
                SvgIcon={({ className }) => (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={theme === 'light' ? '#787A91' : 'currentColor'} className={className}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                )}
                name="nft-list"
                isActive={location.pathname === "/nft-list"}
              />
              <div className={`absolute left-[60px] top-1/2 transform -translate-y-1/2 ${
                theme === 'light'
                  ? 'bg-[#F5EDED] text-[#2B2B2B] shadow-md'
                  : 'bg-[#2c2f32] text-white'
              } text-sm px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
                Explore NFTs
              </div>
            </div>
            {/* Your NFT Icon */}
            <div className="relative group">
              <Icon
                styles={`${
                  theme === 'light'
                    ? 'bg-[#F5EDED] hover:bg-[#787A91] hover:bg-opacity-20'
                    : 'bg-[#1c1c24] hover:bg-[#2c2f32]'
                } transition-all duration-200 md:h-[48px] sm:h-[36px]`}
                handleClick={() => navigate("/your-nfts")}
                theme={theme}
                SvgIcon={({ className }) => (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={theme === 'light' ? '#787A91' : 'currentColor'} className={className}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                name="your-nfts"
                isActive={location.pathname === "/your-nfts"}
              />
              <div className={`absolute left-[60px] top-1/2 transform -translate-y-1/2 ${
                theme === 'light'
                  ? 'bg-[#F5EDED] text-[#2B2B2B] shadow-md'
                  : 'bg-[#2c2f32] text-white'
              } text-sm px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
                Your NFTs
              </div>
            </div>
            {/* Chat Icon */}
            <div className="relative group">
              <Icon
                styles={`${
                  theme === 'light'
                    ? 'bg-[#F5EDED] hover:bg-[#787A91] hover:bg-opacity-20'
                    : 'bg-[#1c1c24] hover:bg-[#2c2f32]'
                } transition-all duration-200 md:h-[48px] sm:h-[36px]`}
                handleClick={() => navigate('/chat')}
                theme={theme}
                SvgIcon={FaComments}
                name="chat"
                isActive={location.pathname === "/chat"}
              />
              <div className={`absolute left-[60px] top-1/2 transform -translate-y-1/2 ${
                theme === 'light'
                  ? 'bg-[#F5EDED] text-[#2B2B2B] shadow-md'
                  : 'bg-[#2c2f32] text-white'
              } text-sm px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
                Chat
              </div>
            </div>
          </div>
          {/* Bottom section inside the sidebar box: Theme toggle and logout */}
          <div className="flex flex-col items-center gap-2 mt-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            {navlinks.filter(link => link.name === 'logout').map((link) => (
              <div key={link.name} className="relative group mb-2">
                <Icon
                  styles={`md:h-[48px] sm:h-[36px] ${theme === 'light' ? 'bg-[#F5EDED]' : ''}`}
                  {...link}
                  isActive={location.pathname === link.link}
                  handleClick={() => handleNavigation(link)}
                  theme={theme}
                />
                <div className={`absolute left-[60px] top-1/2 transform -translate-y-1/2 ${
                  theme === 'light'
                    ? 'bg-[#F5EDED] text-[#2B2B2B] shadow-md'
                    : 'bg-[#2c2f32] text-white'
                } text-sm px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
                  {link.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
