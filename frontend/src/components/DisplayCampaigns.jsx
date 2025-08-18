import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import FundCard from "./FundCard";
import { loader } from "../assets";

const DisplayCampaigns = ({ title, isLoading, campaigns }) => {
  const navigate = useNavigate();
  const [localCampaigns, setLocalCampaigns] = useState(campaigns);

  useEffect(() => {
    // console.log(campaigns[0]);
    setLocalCampaigns(campaigns);
  }, [campaigns]);

  const handleNavigate = (campaign) => {
    navigate(`/campaign-details/${campaign._id}`, { state: campaign });
  };

  const handleUpvote = (campaignId) => {
    setLocalCampaigns((prevCampaigns) =>
      prevCampaigns.map((campaign) =>
        campaign._id === campaignId
          ? { ...campaign, likes: (campaign.likes || 0) + 1 }
          : campaign
      )
    );
  };



  return (
    <div>
      <h1 className="font-epilogue font-semibold text-[18px] text-left text-black dark:text-white">
        {title} ({localCampaigns.length})
      </h1>

      <div className="flex flex-wrap mt-[20px] gap-[26px]">
        {isLoading ? (
          <img
            src={loader}
            alt="loader"
            className="w-[100px] h-[100px] object-contain"
          />
        ) : (
          <>
            {localCampaigns.length === 0 && (
              <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
                There are no campaigns.
              </p>
            )}
            {localCampaigns.length > 0 &&
              localCampaigns.map((campaign) => (
                <FundCard
                  key={uuidv4()}
                  {...campaign}
                  id={campaign._id}
                  handleClick={() => handleNavigate(campaign)}
                  handleUpvote={() => handleUpvote(campaign._id)} // Pass the upvote function with campaign ID
                />
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default DisplayCampaigns;
