import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useStateContext } from '../context/StateContext';
import { CustomButton, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';

const NFTDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { theme, buyNFT, address } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');

  const handlePurchase = async () => {
    setIsLoading(true);

    await buyNFT(state.pId, amount);

    navigate('/your-nfts');
    setIsLoading(false);
  }

  return (
    <div>
      {isLoading && <Loader />}

      <div className={`w-full flex md:flex-row flex-col mt-10 gap-[30px] ${
        theme === 'light' ? 'text-[#2B2B2B]' : 'text-white'
      }`}>
        <div className="flex-1 flex-col">
          <img src={state.image} alt="campaign" className="w-full h-[410px] object-cover rounded-xl"/>
          <div className={`relative w-full h-[5px] bg-[#3a3a43] mt-2 rounded-lg ${
            theme === 'light' ? 'bg-[#E8E8E8]' : 'bg-[#3a3a43]'
          }`}>
            <div className={`absolute h-full ${
              theme === 'light' ? 'bg-[#787A91]' : 'bg-[#4acd8d]'
            }`}
            style={{ width: `${calculateBarPercentage(state.target, state.amountCollected)}%`, maxWidth: '100%'}}>
            </div>
          </div>
        </div>

        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <div className={`flex flex-col items-center w-[150px] ${
            theme === 'light' ? 'bg-[#F5EDED] border border-[#787A91]' : 'bg-[#1c1c24]'
          } rounded-[10px] px-3 py-4`}>
            <h4 className={`font-epilogue font-bold text-[30px] p-3 ${
              theme === 'light' ? 'text-[#2B2B2B]' : 'text-white'
            } text-center`}>
              {state.price}
            </h4>
            <p className={`font-epilogue font-normal text-[16px] ${
              theme === 'light' ? 'text-[#787A91]' : 'text-[#808191]'
            } text-center`}>
              Price in ETH
            </p>
          </div>
        </div>
      </div>

      <div className={`mt-[60px] flex lg:flex-row flex-col gap-5 ${
        theme === 'light' ? 'text-[#2B2B2B]' : 'text-white'
      }`}>
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className={`font-epilogue font-semibold text-[18px] ${
              theme === 'light' ? 'text-[#2B2B2B]' : 'text-white'
            } uppercase`}>
              Creator
            </h4>

            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className={`w-[52px] h-[52px] flex items-center justify-center rounded-full ${
                theme === 'light' ? 'bg-[#787A91]' : 'bg-[#2c2f32]'
              } cursor-pointer`}>
                <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain"/>
              </div>
              <div>
                <h4 className={`font-epilogue font-semibold text-[14px] ${
                  theme === 'light' ? 'text-[#2B2B2B]' : 'text-white'
                } break-all`}>
                  {state.owner}
                </h4>
                <p className={`mt-[4px] font-epilogue font-normal text-[12px] ${
                  theme === 'light' ? 'text-[#787A91]' : 'text-[#808191]'
                }`}>
                  NFT Creator
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className={`font-epilogue font-semibold text-[18px] ${
              theme === 'light' ? 'text-[#2B2B2B]' : 'text-white'
            } uppercase`}>
              Story
            </h4>

            <div className="mt-[20px]">
              <p className={`font-epilogue font-normal text-[16px] ${
                theme === 'light' ? 'text-[#787A91]' : 'text-[#808191]'
              } leading-[26px] text-justify`}>
                {state.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h4 className={`font-epilogue font-semibold text-[18px] ${
            theme === 'light' ? 'text-[#2B2B2B]' : 'text-white'
          } uppercase`}>
            Buy
          </h4>   

          <div className={`mt-[20px] flex flex-col p-4 rounded-[10px] ${
            theme === 'light' ? 'bg-[#F5EDED] border border-[#787A91]' : 'bg-[#1c1c24]'
          }`}>
            <p className={`font-epilogue font-medium text-[20px] leading-[30px] text-center ${
              theme === 'light' ? 'text-[#787A91]' : 'text-[#808191]'
            }`}>
              Buy this NFT
            </p>
            <div className="mt-[30px]">
              <input 
                type="number"
                placeholder="ETH 0.1"
                step="0.01"
                className={`w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] rounded-[10px] font-epilogue text-[18px] leading-[30px] placeholder:text-[#787A91] ${
                  theme === 'light' 
                    ? 'bg-[#F5EDED] border-[#787A91] text-[#2B2B2B]' 
                    : 'bg-transparent border-[#3a3a43] text-white'
                }`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                <h4 className={`font-epilogue font-semibold text-[14px] leading-[22px] ${
                  theme === 'light' ? 'text-[#2B2B2B]' : 'text-white'
                }`}>
                  Back it because you believe in it.
                </h4>
                <p className={`mt-[20px] font-epilogue font-normal leading-[22px] ${
                  theme === 'light' ? 'text-[#787A91]' : 'text-[#808191]'
                }`}>
                  Support the project for no reward, just because it speaks to you.
                </p>
              </div>

              <CustomButton 
                btnType="button"
                title="Buy NFT"
                styles={theme === 'light' ? 'bg-[#787A91] w-full' : 'bg-[#8c6dfd] w-full'}
                handleClick={handlePurchase}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NFTDetail 