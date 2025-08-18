import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomButton from "./CustomButton";
import { funn, menu, profile } from "../assets";
import { useStateContext } from "../context/StateContext";

const HomeNavbar = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { connect, address, theme } = useStateContext();

  const handleConnect = async () => {
    setLoading(true);
    const success = await connect();
    setLoading(false);
    // Optionally, you could navigate or show a message on success
  };

  return (
    <nav className={`fixed top-0 left-0 w-full flex justify-between items-center p-4 shadow-md z-50 h-20 transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-white text-gray-900 border-b border-gray-200' 
        : 'bg-white text-white'
    }`}>
      {/* Logo and Brand Name Section */}
      <div className="flex items-center px-0 py-15 h-30 gap-0">
        <img
          src={funn}
          alt="Fundify logo"
          className="w-40 h-auto max-h-[80px] object-contain hover:scale-105 transition-transform duration-300"
        />
        <span className={`font-bold text-[24px] ${
          theme === 'light' 
            ? 'text-[#001F3F]' 
            : 'text-gray-900'
        }`}>FUNDIFYNFT</span>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        <CustomButton
          btnType="button"
          title={address ? "Dashboard" : (loading ? "Connecting..." : "Connect Wallet")}
          styles={
            address
              ? `${theme === 'light' 
                  ? 'bg-[#4b5264] hover:bg-[#374151]' 
                  : 'bg-[#1dc071] hover:bg-[#18a85f]'
                } text-white text-sm px-6 py-2 rounded-lg transition-all`
              : `${theme === 'light'
                  ? 'bg-[#8247e5] hover:bg-[#7037d9]'
                  : 'bg-[#8c6dfd] hover:bg-[#7b5ce8]'
                } text-white font-semibold text-base px-8 py-3 rounded-[32px] transition-all`
          }
          handleClick={() => {
            if (address) navigate("/dashboard");
            else handleConnect();
          }}
          disabled={loading}
        />

        {address && (
          <Link to="/profile">
            <div className={`w-12 h-12 rounded-full flex justify-center items-center cursor-pointer transition-all ${
              theme === 'light'
                ? 'bg-gray-200 hover:bg-gray-300'
                : 'bg-[#2c2f32] hover:bg-[#3a3d40]'
            }`}>
              <img
                src={profile}
                alt="user profile"
                className="w-7 h-7 object-contain"
              />
            </div>
          </Link>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center">
        <img
          src={menu}
          alt="menu"
          className="w-8 h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setIsDrawerOpen((prev) => !prev)}
        />

        {/* Mobile Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-64 shadow-lg transform ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out z-50 ${
            theme === 'light'
              ? 'bg-white'
              : 'bg-[#1c1c24]'
          }`}
        >
          <div className="p-6">
            <button
              className={`absolute top-4 right-4 text-2xl transition-colors ${
                theme === 'light'
                  ? 'text-gray-600 hover:text-gray-800'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setIsDrawerOpen(false)}
            >
              &times;
            </button>

            <div className="mt-12">
              <CustomButton
                btnType="button"
                title={address ? "Dashboard" : (loading ? "Connecting..." : "Connect Wallet")}
                styles={
                  address
                    ? `${theme === 'light'
                        ? 'bg-[#4b5264] hover:bg-[#374151]'
                        : 'bg-[#1dc071] hover:bg-[#18a85f]'
                      } text-white text-sm px-6 py-2 rounded-lg transition-all w-full`
                    : `${theme === 'light'
                        ? 'bg-[#8247e5] hover:bg-[#7037d9]'
                        : 'bg-[#8c6dfd] hover:bg-[#7b5ce8]'
                      } text-white font-semibold text-base px-8 py-3 rounded-[32px] transition-all w-full`
                }
                handleClick={() => {
                  if (address) navigate("/dashboard");
                  else handleConnect();
                }}
                disabled={loading}
              />
            </div>

            {address && (
              <Link to="/profile" className="block mt-6">
                <div className={`w-12 h-12 rounded-full flex justify-center items-center cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'bg-gray-200 hover:bg-gray-300'
                    : 'bg-[#2c2f32] hover:bg-[#3a3d40]'
                }`}>
                  <img
                    src={profile}
                    alt="user profile"
                    className="w-7 h-7 object-contain"
                  />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;