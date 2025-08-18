import React, { useState, useEffect } from "react";
import { DisplayCampaigns } from "../components";
import { useStateContext } from "../context/StateContext";

const Campaigns = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]); // Store all fetched campaigns
  const [selectedCategory, setSelectedCategory] = useState("all"); // Store selected category

  const { address } = useStateContext(); // Get logged-in address from context

  // Fetch campaigns when address exists
  const fetchCampaigns = async () => {
    setIsLoading(true); // Start loading
    try {
      // Fetch all campaigns excluding the current user's wallet address
      const response = await fetch(`http://localhost:5001/api/schema`);
      const data = await response.json();
      console.log("Fetched campaigns data:", data);

      if (data.data) {
        setCampaigns(data.data); // Set the campaigns data
      } else {
        console.log("No campaigns found.");
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
    setIsLoading(false); // Stop loading
  };

  useEffect(() => {
    fetchCampaigns(); // Fetch campaigns on component mount
  }, []);

  // Handle category change in the filter dropdown
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value); // Update selected category
  };

  // Filter campaigns by selected category (excluding current user's campaigns)
  const filteredCampaigns = campaigns.filter(
    (campaign) => campaign.wallet_address !== address // Exclude current user's campaigns
  );

  // Further filter campaigns based on selected category
  const categoryFilteredCampaigns =
    selectedCategory === "all"
      ? filteredCampaigns // No category filter
      : filteredCampaigns.filter((campaign) => campaign.category === selectedCategory); // Filter by category

  return (
    <>
      {/* Top bar with search, filter, and create button */}
      <div className="flex justify-between items-center mb-4 w-full">
        <div></div> {/* Placeholder for left alignment, e.g., search bar if needed */}
        <div className="flex items-center ml-auto">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="p-2 border rounded-md bg-[#1c1c24] text-white"
          >
            <option value="all">All</option>
            <option value="art">Art</option>
            <option value="technology">Technology</option>
            <option value="charity">Charity</option>
            <option value="education">Education</option>
          </select>
        </div>
      </div>

      {/* Display Campaigns */}
      <DisplayCampaigns
        title="Discover Campaigns"
        isLoading={isLoading}
        campaigns={categoryFilteredCampaigns} // Pass the filtered campaigns to DisplayCampaigns component
      />
    </>
  );
};

export default Campaigns;
