import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useStateContext } from "../context/StateContext";
import { CountBox, CustomButton, Loader } from "../components";
import { calculateBarPercentage, daysLeft } from "../utils";

const CampaignDetails = () => {
  const { state } = useLocation();
  const { id: urlPid } = useParams(); // Get from URL params
  const navigate = useNavigate();
const { contract, address, theme, fundCampaignOnChain, fundCampaignDirectly } = useStateContext();


  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [donators, setDonators] = useState([]);
  const [amountCollected, setAmountCollected] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [blockchainIndex, setBlockchainIndex] = useState(null);

  // Get campaignId from either state or URL params
  const campaignId = state?.pId || urlPid;

  useEffect(() => {
    console.log("Current campaign ID:", campaignId);
    console.log("State:", state);
    console.log("URL Params ID:", urlPid);
  }, [campaignId, state, urlPid]);

  if (!campaignId) {
    return <div>Error: Campaign ID not found. Please navigate from a valid campaign page.</div>;
  }

  // Destructure from state if available
  const { deadline, target, description, owner, image, category } = state || {};
  const remainingDays = daysLeft(deadline);

  // Fetch donators from blockchain
  const fetchDonators = async () => {
    try {
      const donatorsList = await contract.getDonators(campaignId);
      setDonators(donatorsList);
    } catch (error) {
      console.error("Error fetching donators:", error);
    }
  };

  // Fetch campaign from MongoDB
  const fetchCampaignDataFromDB = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/schema/${campaignId}`);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const campaign = data[0];
        if (campaign.amountCollected) {
          setAmountCollected(campaign.amountCollected);
        }
        if (campaign.blockchainIndex !== undefined) {
          setBlockchainIndex(campaign.blockchainIndex);
        }
        if (!state && campaign.deadline) {
          // If no state was passed, use data from DB
          setDeadline(campaign.deadline);
          setTarget(campaign.target);
          setDescription(campaign.description);
          setImage(campaign.image);
        }
      }
    } catch (error) {
      console.error("Error fetching campaign data from Mongo:", error);
    }
  };

  // Fetch feedback from backend
  const fetchFeedback = async () => {
    try {
      console.log("Fetching feedback for campaign:", campaignId);
      console.log("Campaign ID type:", typeof campaignId);
      const res = await fetch(`http://localhost:5001/api/feedback/${campaignId}`);
      console.log("Feedback response status:", res.status);
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Feedback error response:", errorData);
        throw new Error(errorData.error || "Failed to fetch feedbacks");
      }
      const data = await res.json();
      console.log("Fetched feedbacks:", data);
      setFeedbacks(data.data || []);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
    }
  };

  useEffect(() => {
    if (campaignId) {
      console.log("Fetching initial data for campaign:", campaignId);
      if (contract) {
        fetchDonators();
        fetchCampaignDataFromDB();
      }
      // Fetch feedback regardless of contract
      fetchFeedback();
    }
  }, [campaignId, contract]);

  // Separate useEffect for feedback polling
  useEffect(() => {
    if (campaignId) {
      // Initial fetch
      fetchFeedback();

      // Set up polling every 5 seconds
      const intervalId = setInterval(() => {
        fetchFeedback();
      }, 5000);

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [campaignId]);

const handleDonate = async () => {
  const sanitizedAmount = amount.trim();

  if (
    !sanitizedAmount ||
    isNaN(sanitizedAmount) ||
    parseFloat(sanitizedAmount) < 0.001 ||
    !/^\d*\.?\d*$/.test(sanitizedAmount)
  ) {
    alert("Please enter a valid donation amount (min 0.001 ETH)");
    return;
  }

  setIsLoading(true);

  try {
    // 1. Get wallet address from backend
    const res = await fetch(`http://localhost:5001/api/get-wallet/${campaignId}`);
    const data = await res.json();
    const campaignOwner = data.walletAddress;

    if (!campaignOwner) {
      alert("Could not find campaign owner's wallet address.");
      return;
    }

    // 2. Call fundCampaignDirectly
    await fundCampaignDirectly(campaignOwner, sanitizedAmount);
    console.log("fundCampaignDirectly:", fundCampaignDirectly);

    alert("Donation successful on blockchain!");

    // 3. UI updates
    setAmount("");
    await fetchDonators();

    // 4. Update MongoDB
    const updatedAmount = parseFloat(amountCollected) + parseFloat(sanitizedAmount);
    setAmountCollected(updatedAmount);
    await fetch(`http://localhost:5001/api/updateCampaign/${campaignId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountCollected: updatedAmount }),
    });
  } catch (err) {
    console.error("Error donating:", err);
    alert("Donation failed: " + err.message);
  } finally {
    setIsLoading(false);
  }
};


  const handleFeedbackSubmit = async () => {
    const trimmedFeedback = feedback.trim();

    if (!trimmedFeedback) {
      alert("Please enter your feedback before submitting.");
      return;
    }

    if (!address) {
      alert("Please connect your wallet to submit feedback.");
      return;
    }

    if (trimmedFeedback.length > 1000) {
      alert("Feedback must be less than 1000 characters");
      return;
    }

    try {
      const feedbackData = {
        walletAddress: address.toLowerCase(),
        campaignId: campaignId.toString(),
        feedback: trimmedFeedback
      };

      console.log("Submitting feedback data:", feedbackData);
      const res = await fetch("http://localhost:5001/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      });

      console.log("Feedback submission response status:", res.status);
      const data = await res.json();
      console.log("Feedback submission response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      alert("Feedback submitted successfully!");
      setFeedback("");
      // Refresh feedback list
      await fetchFeedback();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(error.message || "Failed to submit feedback. Please try again.");
    }
  };

  return (
    <div>
      {isLoading && <Loader />}

      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <img
            src={image}
            alt="campaign"
            className="w-full h-[410px] object-cover rounded-xl"
          />
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            <div
              className="absolute h-full bg-[#4acd8d]"
              style={{
                width: `${calculateBarPercentage(target, amountCollected)}%`,
                maxWidth: "100%",
              }}
            />
          </div>
        </div>

        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Days Left" value={remainingDays} />
          <CountBox title={`Raised of ${target}`} value={`${amountCollected} ETH`} />
          <CountBox title="Total Backers" value={donators.length} />
        </div>
      </div>

      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] uppercase text-black dark:text-white">Story</h4>
            <div className="mt-[20px]">
              <p className="font-epilogue font-normal text-[16px] leading-[26px] text-justify text-black dark:text-[#808191]">
                {description}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] uppercase text-black dark:text-white">Category</h4>
            <div className="mt-[20px]">
              <p className="font-epilogue font-normal text-[16px] leading-[26px] text-justify text-black dark:text-[#808191]">
                {category || 'No category specified'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] uppercase text-black dark:text-white">Donators</h4>
            <div className="mt-[20px] flex flex-col gap-4">
              {donators.length > 0 ? (
                donators.map((donator, index) => (
                  <div key={`${donator}-${index}`} className="flex justify-between items-center gap-4">
                    <p className="font-epilogue font-normal text-[16px] text-black dark:text-[#b2b3bd]">
                      {index + 1}. {donator}
                    </p>
                  </div>
                ))
              ) : (
                <p className="font-epilogue font-normal text-[16px] text-justify text-black dark:text-[#808191]">
                  No donators yet. Be the first one!
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] uppercase text-black dark:text-white">Feedback</h4>
            <div className="mt-[20px]">
              <textarea
                className={`w-full p-4 border rounded-[10px] outline-none bg-white dark:bg-[#1c1c24] text-black dark:text-white border-gray-300 dark:border-[#3a3a43]`}
                placeholder="Share your thoughts about this campaign..."
                rows="4"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <CustomButton
                btnType="button"
                title="Submit Feedback"
                styles="w-full bg-[#4acd8d] mt-4"
                handleClick={handleFeedbackSubmit}
                disabled={!address}
              />
            </div>
            
            <div className="mt-8 space-y-4">
              <h5 className="font-epilogue font-semibold text-[16px] text-black dark:text-white">
                Community Feedback
              </h5>
              {feedbacks.length > 0 ? (
                feedbacks.map((fb, idx) => (
                  <div key={fb._id || idx} className="p-4 rounded-[10px] border bg-white dark:bg-[#1c1c24] text-black dark:text-white border-gray-200 dark:border-[#3a3a43]">
                    <p className="font-epilogue font-normal text-[14px] text-black dark:text-white">
                      {fb.feedback}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <p className="font-epilogue font-normal text-[12px] text-black dark:text-[#808191]">
                        {fb.walletAddress.slice(0, 6)}...{fb.walletAddress.slice(-4)}
                      </p>
                      <p className="font-epilogue font-normal text-[12px] text-black dark:text-[#808191]">
                        {new Date(fb.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="font-epilogue font-normal text-[14px] text-center py-4 text-black dark:text-[#808191]">
                  No feedback yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 mt-[40px] lg:mt-0">
          <h4 className={`font-epilogue font-semibold text-[18px] uppercase ${theme === 'light' ? 'text-black' : 'text-white'}`}>Fund</h4>
          <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
            <p className="font-epilogue font-medium text-[20px] leading-[30px] text-center text-[#808191]">
              Fund the campaign
            </p>
            <div className="mt-[30px]">
              <input
                type="number"
                placeholder="ETH 0.1"
                step="0.01"
                className="w-full mb-10 py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <CustomButton
  
                btnType="button"
                title="Fund Campaign"
                styles="w-full bg-[#8c6dfd]"
                handleClick={handleDonate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;