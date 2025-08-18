import React, { useState } from "react";
import { tagType, punk, like, dislike, thirdweb } from "../assets";
import { daysLeft } from "../utils";
import { useStateContext } from "../context/StateContext";
import { loader } from "../assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FundCard = ({
  owner,
  title,
  description,
  target,
  deadline,
  amountCollected,
  image,
  handleClick,
  id,
  likes,
  liked,
  showDelete,
  handleDelete,
  category,
}) => {
  const [isLiking, setIsLiking] = React.useState(false);
  const [isLiked, setIsLiked] = useState(liked);
  const [likesCount, setLikesCount] = useState(likes);
  const [showShare, setShowShare] = useState(false);
  const { address, theme } = useStateContext();

  const remainingDays = daysLeft(deadline);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsLiking(true);

      const response = await axios.post("http://localhost:5001/api/like", {
        campaign_id: id,
        wallet_address: address,
      });

      if (response.data) {
        setIsLiked(response.data.liked);
        setLikesCount(response.data.likes);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShare(!showShare);
  };

  const shareToSocial = (platform, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Get the current page URL
    const currentUrl = window.location.href;

    switch (platform) {
      case 'facebook':
        // Using the basic Facebook sharer
        const facebookUrl = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        
        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(
          facebookUrl,
          'facebook-share-dialog',
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
        );
        break;
        
      case 'twitter':
        const twitterText = `Check out this campaign: ${title}`;
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(twitterText)}`,
          '_blank'
        );
        break;
        
      case 'whatsapp':
        const whatsappText = `Check out this campaign: ${title}`;
        window.open(
          `https://wa.me/?text=${encodeURIComponent(whatsappText + ' ' + currentUrl)}`,
          '_blank'
        );
        break;
    }
  };

  const baseTextColor = theme === 'light' ? 'text-[#787A91]' : 'text-[#808191]';
  const headingTextColor = theme === 'light' ? 'text-[#2B2B2B]' : 'text-white';
  const bgColor = theme === 'light' ? 'bg-[#F5EDED]' : 'bg-[#1c1c24]';
  const hoverBgColor = theme === 'light' ? 'hover:bg-[#787A91]/20' : 'hover:bg-[#2c2f32]';

  return (
    <div
      className={`sm:w-[288px] w-full rounded-[15px] cursor-pointer transition-all duration-300 ${bgColor} ${
        theme === 'light' ? 'hover:shadow-lg border border-[#787A91]' : 'hover:shadow-2xl'
      }`}
      onClick={handleClick}
    >
      <div className="relative rounded-[15px] p-3">
        <img
          src={image || thirdweb}
          alt="fund"
          className="w-full h-[158px] object-cover rounded-[15px]"
        />
        {isLiked && (
          <div className="absolute top-5 right-5 bg-[#787A91] rounded-full p-1">
            <img src={like} alt="liked" className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex flex-col p-4">
        <div className="flex flex-row items-center mb-[18px]">
          <img
            src={tagType}
            alt="tag"
            className="w-[17px] h-[17px] object-contain"
          />
          <p className={`ml-[12px] mt-[2px] font-epilogue font-medium text-[12px] ${baseTextColor}`}>
            {category || 'Category'}
          </p>
        </div>

        <div className="block">
          <h3 className={`font-epilogue font-semibold text-[16px] text-left leading-[26px] truncate ${headingTextColor}`}>
            {title}
          </h3>
          <p className={`mt-[5px] font-epilogue font-normal text-[12px] text-left leading-[18px] truncate ${baseTextColor}`}>
            {description}
          </p>
        </div>

        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className={`font-epilogue font-semibold text-[14px] leading-[22px] ${headingTextColor}`}>
              {amountCollected}
            </h4>
            <p className={`mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] sm:max-w-[120px] truncate ${baseTextColor}`}>
              Raised of {target}
            </p>
          </div>
          <div className="flex flex-col">
            <h4 className={`font-epilogue font-semibold text-[14px] leading-[22px] ${headingTextColor}`}>
              {remainingDays}
            </h4>
            <p className={`mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] sm:max-w-[120px] truncate ${baseTextColor}`}>
              Days Left
            </p>
          </div>
        </div>

        <div className="flex items-center mt-[20px] gap-[12px]">
          <div className={`w-[30px] h-[30px] rounded-full flex justify-center items-center ${theme === 'light' ? 'bg-[#787A91]' : 'bg-[#13131a]'}`}>
            <img
              src={thirdweb}
              alt="user"
              className="w-1/2 h-1/2 object-contain"
            />
          </div>
          <p className={`flex-1 font-epilogue font-normal text-[12px] truncate ${baseTextColor}`}>
            by <span className={headingTextColor}>{owner}</span>
          </p>
          
          <div className="flex items-center gap-[5px]">
            <button 
              disabled={isLiking} 
              onClick={handleLike}
              className={`p-2 rounded-full transition-colors duration-200 ${hoverBgColor}`}
            >
              <img
                src={isLiking ? loader : (isLiked ? dislike : like)}
                alt="like"
                className="w-[20px] h-[20px]"
              />
            </button>
            <p className={`font-epilogue font-normal text-[12px] ${baseTextColor}`}>
              {likesCount}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={handleShare}
              className={`p-2 rounded-full transition-colors duration-200 ${hoverBgColor}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>

            {showShare && (
              <div className={`absolute bottom-full right-0 mb-2 p-2 rounded-lg shadow-lg ${bgColor} border border-gray-200 flex gap-2`}>
                <button
                  onClick={(e) => shareToSocial('facebook', e)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </button>
                <button
                  onClick={(e) => shareToSocial('twitter', e)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button
                  onClick={(e) => shareToSocial('whatsapp', e)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {showDelete && (
            <button
              onClick={(e) => handleDelete && handleDelete(e)}
              className={`p-2 rounded-full transition-colors duration-200 ${hoverBgColor}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke={theme === 'light' ? '#787A91' : 'currentColor'}
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundCard;
