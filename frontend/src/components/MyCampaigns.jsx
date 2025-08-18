import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { useStateContext } from "../context/StateContext";
import FundCard from "../components/FundCard"; // Ensure path is correct
import { charity } from "../assets"; // Assuming you have some default images

export default function MyCampaigns() {
  const { address } = useStateContext(); // Get the current connected wallet address
  const [campaigns, setCampaigns] = useState([]); // State to store campaigns
  const [currentCampaigns, setCurrentCampaigns] = useState(0); // State to store count of campaigns
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    if (typeof address !== 'string' || !address) return;
    console.log("[MyCampaigns] Current wallet address:", address);
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/schema`);
        const data = await response.json();
        console.log("[MyCampaigns] Fetched all campaigns data:", data);
        if (data.data && data.data.length > 0) {
          // Only show campaigns for the current wallet
          const userCampaigns = data.data.filter(
            (campaign) => campaign.wallet_address && campaign.wallet_address.toLowerCase() === address.toLowerCase()
          );
          setCampaigns(userCampaigns);
          setCurrentCampaigns(userCampaigns.length);
        } else {
          setCampaigns([]);
          setCurrentCampaigns(0);
          console.log("[MyCampaigns] No campaigns found.");
        }
      } catch (error) {
        console.error("[MyCampaigns] Error fetching campaigns:", error);
      }
    };
    fetchCampaigns();
  }, [address]);

  if (!address) {
    return (
      <div className="flex flex-col mt-[20px] gap-[10px]">
        <p className="text-xl text-black dark:text-white">
          Please connect your wallet to view your campaigns.
        </p>
      </div>
    );
  }

  // Handle campaign click to navigate to campaign details page
  const handleCampaignClick = (id) => {
    const selectedCampaign = campaigns.find((campaign) => campaign._id === id); // Find the selected campaign by ID
    if (selectedCampaign) {
      // Pass the campaign data as state to the next page
      navigate(`/campaign-details/${id}`, {
        state: selectedCampaign,
      });
    }
  };

  // Handle deleting a campaign
  const handleDeleteCampaign = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/schema/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove campaign from state if successful
        setCampaigns(campaigns.filter((campaign) => campaign._id !== id));
        setCurrentCampaigns(campaigns.length - 1);
        console.log(`Campaign with ID ${id} deleted successfully.`);
      } else {
        console.error("Error deleting campaign:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  return (
    <div className="flex flex-col mt-[20px] gap-[10px]">
      <h1 className="font-epilogue font-semibold text-[18px] text-left text-black dark:text-white">
        My Campaigns ({campaigns.length})
      </h1>

      {campaigns.length === 0 ? (
        <p className="text-black dark:text-white">No campaigns found.</p>
      ) : (
        <>
          <div className="flex flex-wrap mt-[20px] gap-[26px]">
            {campaigns.map((campaign) => (
              <FundCard
                key={campaign._id}
                owner={campaign.name}
                title={campaign.campaign_title}
                description={campaign.description}
                target={campaign.goal}
                deadline={campaign.deadline}
                amountCollected={campaign.amountCollected || 0}
                image={campaign.image || charity}
                id={campaign._id}
                category={campaign.category}
                handleClick={() => handleCampaignClick(campaign._id)}
                handleUpvote={(id) => console.log("Upvoted campaign ID:", id)}
                handleDelete={(e) => { e.stopPropagation(); handleDeleteCampaign(campaign._id); }}
                showDelete={true}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
