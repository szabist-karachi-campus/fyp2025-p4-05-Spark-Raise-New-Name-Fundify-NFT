import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../context/StateContext";
import { CustomButton } from "./";
import { logo, menu, profile, search, thirdweb } from "../assets";
import { navlinks } from "../constants";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { connect, address, theme } = useStateContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [isActive, setIsActive] = useState('dashboard');
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const { toggleTheme } = useTheme();

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // Check if it's a campaign or NFT search based on query type
    if (searchQuery.toLowerCase().includes("nft")) {
      navigate(`/search/nfts?q=${searchQuery}`);
    } else {
      navigate(`/search/campaigns?q=${searchQuery}`);
    }
  };

  return (
    <div className={`flex md:flex-row flex-col-reverse justify-between mb-[35px] gap-6 ${
      theme === 'light' ? 'bg-[#F5EDED]' : ''
    }`}>
      <div className="lg:flex-1 flex flex-row max-w-[458px] py-2 pl-4 pr-2 h-[52px] rounded-[100px] border border-[#787A91]">
        <input 
          type="text"
          placeholder="Search for campaigns"
          className={`flex w-full font-epilogue font-normal text-[14px] placeholder:text-[#787A91] outline-none ${
            theme === 'light' ? 'bg-[#F5EDED] text-[#2B2B2B]' : 'bg-transparent text-white'
          }`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className={`w-[72px] h-full rounded-[20px] flex justify-center items-center cursor-pointer ${
          theme === 'light' ? 'bg-[#E8E8E8]' : 'bg-[#4acd8d]'
        }`}
          onClick={handleSearch}
        >
          <img src={search} alt="search" className="w-[15px] h-[15px] object-contain"/>
        </div>
      </div>

      <div className="sm:flex hidden flex-row justify-end gap-4">
        <CustomButton 
          btnType="button"
          title={address ? 'Create a campaign' : 'Connect'}
          styles={theme === 'light' ? 'bg-[#787A91]' : 'bg-[#1dc071]'}
          handleClick={() => {
            if(address) navigate('create-campaign')
            else connect();
          }}
        />

        <Link to="/profile">
          <div className={`w-[52px] h-[52px] rounded-full flex justify-center items-center cursor-pointer ${
            theme === 'light' ? 'bg-[#E8E8E8]' : 'bg-[#2c2f32]'
          }`}>
            <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain" />
          </div>
        </Link>
      </div>

      {/* Small screen navigation */}
      <div className="sm:hidden flex justify-between items-center relative">
        <div className={`w-[40px] h-[40px] rounded-[10px] flex justify-center items-center cursor-pointer ${
          theme === 'light' ? 'bg-[#E8E8E8]' : 'bg-[#2c2f32]'
        }`}>
          <img src={logo} alt="user" className="w-[60%] h-[60%] object-contain" />
        </div>

        <img 
          src={menu}
          alt="menu"
          className="w-[34px] h-[34px] object-contain cursor-pointer"
          onClick={() => setToggleDrawer((prev) => !prev)}
        />

        <div className={`absolute top-[60px] right-0 left-0 bg-[${theme === 'light' ? '#F5EDED' : '#1c1c24'}] z-10 shadow-secondary py-4 ${!toggleDrawer ? '-translate-y-[100vh]' : 'translate-y-0'} transition-all duration-700`}>
          <ul className="mb-4">
            {navlinks.map((link) => (
              <li
                key={link.name}
                className={`flex p-4 ${isActive === link.name && (theme === 'light' ? 'bg-[#E8E8E8]' : 'bg-[#3a3a43]')}`}
                onClick={() => {
                  setIsActive(link.name);
                  setToggleDrawer(false);
                  navigate(link.link);
                }}
              >
                <img 
                  src={link.imgUrl}
                  alt={link.name}
                  className={`w-[24px] h-[24px] object-contain ${
                    isActive === link.name ? 'grayscale-0' : 'grayscale'
                  }`}
                />
                <p className={`ml-[20px] font-epilogue font-semibold text-[14px] ${
                  isActive === link.name 
                    ? theme === 'light' ? 'text-[#2B2B2B]' : 'text-[#1dc071]'
                    : theme === 'light' ? 'text-[#787A91]' : 'text-[#808191]'
                }`}>
                  {link.name}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex mx-4">
            <CustomButton 
              btnType="button"
              title={address ? 'Create a campaign' : 'Connect'}
              styles={theme === 'light' ? 'bg-[#787A91] w-full' : 'bg-[#1dc071] w-full'}
              handleClick={() => {
                if(address) navigate('create-campaign')
                else connect();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
