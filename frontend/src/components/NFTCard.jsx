import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context/StateContext';
import { thirdweb } from '../assets';

const NFTCard = ({ id, title, description, image, price, owner }) => {
  const navigate = useNavigate();
  const { theme } = useStateContext();

  return (
    <div 
      className={`sm:w-[288px] w-full rounded-[15px] cursor-pointer transition-all duration-300 ${
        theme === 'light'
          ? 'bg-[#F5EDED] hover:shadow-lg border border-[#787A91]'
          : 'bg-[#1c1c24] hover:shadow-2xl'
      }`}
      onClick={() => navigate(`/nft/${id}`)}
    >
      <img 
        src={image || thirdweb} 
        alt="nft" 
        className="w-full h-[158px] object-cover rounded-t-[15px]"
      />

      <div className="flex flex-col p-4">
        <div className="block">
          <h3 className={`font-epilogue font-semibold text-[16px] text-left leading-[26px] truncate ${
            theme === 'light' ? 'text-[#2B2B2B]' : 'text-white'
          }`}>
            {title}
          </h3>
          <p className={`mt-[5px] font-epilogue font-normal text-[12px] text-left leading-[18px] truncate ${
            theme === 'light' ? 'text-[#787A91]' : 'text-[#808191]'
          }`}>
            {description}
          </p>
        </div>

        <div className="flex justify-between items-center mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className={`font-epilogue font-semibold text-[14px] leading-[22px] ${
              theme === 'light' ? 'text-[#2B2B2B]' : 'text-[#b2b3bd]'
            }`}>
              {price} ETH
            </h4>
          </div>
        </div>

        <div className="flex items-center mt-[20px] gap-[12px]">
          <div className={`w-[30px] h-[30px] rounded-full flex justify-center items-center ${
            theme === 'light' ? 'bg-[#787A91]' : 'bg-[#13131a]'
          }`}>
            <img 
              src={thirdweb} 
              alt="user" 
              className="w-1/2 h-1/2 object-contain"
            />
          </div>
          <p className={`flex-1 font-epilogue font-normal text-[12px] truncate ${
            theme === 'light' ? 'text-[#787A91]' : 'text-[#808191]'
          }`}>
            by <span className={theme === 'light' ? 'text-[#2B2B2B]' : 'text-[#b2b3bd]'}>{owner}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NFTCard; 