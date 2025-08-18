import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';
import { motion } from 'framer-motion'; // For animations
import { useStateContext } from '../context/StateContext';
import { money } from '../assets';
import { CustomButton, FormField, Loader } from '../components';
import { checkIfImage } from '../utils';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { createCampaign, createCampaignOnChain, theme } = useStateContext();
  const [walletAddress, setWalletAddress] = useState('');
  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    target: '',
    deadline: '',
    image: '',
    category: '', // New category field
  });
  const [dateError, setDateError] = useState(''); // State to handle date validation error

  // Automatically fetch connected wallet address when component mounts
  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setWalletAddress(accounts[0]); // Set the first connected wallet address
        } catch (error) {
          console.error("Error fetching wallet address:", error);
          alert("Please connect your wallet to create a campaign.");
        }
      } else {
        alert("MetaMask not detected. Please install MetaMask to proceed.");
      }
    };

    fetchWalletAddress();
  }, []);

  const handleFormFieldChange = (fieldName, e) => {
    if (fieldName === 'deadline') {
      const selectedDate = new Date(e.target.value);
      const currentDate = new Date();

      // Check if the selected date is in the past
      if (selectedDate < currentDate) {
        setDateError('Please select a date in the future.');
      } else {
        setDateError(''); // Clear the error if the date is valid
      }
    }

    setForm({ ...form, [fieldName]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the selected date is in the past
    const selectedDate = new Date(form.deadline);
    const currentDate = new Date();
    if (selectedDate < currentDate) {
      setDateError('Please select a date in the future.');
      return;
    }

    // Basic validation to check if all required fields are filled
    if (!form.name || !form.title || !form.description || !form.target || !form.deadline || !form.image || !form.category) {
      alert("All fields are required!");
      return;
    }

    if (!walletAddress) {
      alert("Please connect your wallet to proceed.");
      return;
    }

    // Validate image URL
    if (!form.image || form.image.trim() === "") {
      alert("Please provide an image URL.");
      return;
    }

    setIsLoading(true); // Start loading

    checkIfImage(form.image, async (exists) => {
      if (exists) {
        try {
          // Validate deadline (future timestamp)
          const deadlineTimestamp = Math.floor(new Date(form.deadline).getTime() / 1000);
          const now = Math.floor(Date.now() / 1000);
          if (deadlineTimestamp <= now) {
            setIsLoading(false);
            alert('Deadline must be in the future.');
            return;
          }

          // Validate network before MongoDB save
          try {
            await window.ethereum.request({ method: 'eth_chainId' });
            // If not on Amoy, this will be handled in createCampaignOnChain
          } catch (err) {
            setIsLoading(false);
            alert('Please connect MetaMask.');
            return;
          }

          // Send data to backend API (MongoDB)
          const targetInETH = ethers.utils.parseUnits(form.target, 18).toString();
          const response = await axios.post('http://localhost:5001/api/schema', {
            name: form.name,
            campaign_title: form.title,
            description: form.description,
            goal: targetInETH,
            deadline: form.deadline,
            image: form.image,
            category: form.category,
            wallet_address: walletAddress
          });
          const mongoCampaignId = response.data.data._id;

          // After MongoDB save, call blockchain
          try {
            // 1. Validate and convert target to wei
            let targetInWei;
            try {
              targetInWei = ethers.utils.parseEther(form.target);
            } catch (err) {
              setIsLoading(false);
              alert("Invalid target amount. Please enter a valid number.");
              return;
            }

            // 2. Ensure user is on Polygon Amoy (chainId 80002)
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const { chainId } = await provider.getNetwork();
            if (chainId !== 80002) {
              setIsLoading(false);
              alert("Please switch MetaMask to the Polygon Amoy network (chainId 80002).");
              return;
            }

            // 3. Create campaign on-chain with correct values and gas limit
            const receipt = await createCampaignOnChain(
              form.title,
              form.description,
              targetInWei.toString(),
              deadlineTimestamp
            );

            // 4. Fetch campaignCount from contract to get the new campaign index
            const contract = new ethers.Contract(
              "0x3e84af4Ed606D47C453947AA2dBC2aEac3922E45",
              [
                { "inputs": [], "name": "campaignCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
              ],
              provider
            );
            const campaignCount = await contract.campaignCount();
            const blockchainIndex = campaignCount.toNumber() - 1;

            // 5. Update MongoDB campaign with blockchainIndex using _id
            await axios.post('http://localhost:5001/api/updateCampaignBlockchainIndex', {
              _id: mongoCampaignId,
              blockchainIndex: blockchainIndex
            });

            setIsLoading(false);
            navigate('/');
            alert('Campaign created successfully on MongoDB and Blockchain!');
          } catch (blockchainError) {
            setIsLoading(false);
            console.error('Blockchain error:', blockchainError);
            alert('MongoDB saved, but blockchain failed: ' + JSON.stringify(blockchainError));
          }
        } catch (error) {
          setIsLoading(false);
          console.error('Error creating campaign:', error);
          alert('Failed to create campaign');
        }
      } else {
        setIsLoading(false); // Stop loading if image doesn't exist
        alert('The provided image URL is invalid. Please provide a valid image URL.');
        setForm({ ...form, image: '' }); // Clear the invalid image URL field
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }} // Fade-in animation
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4 ${
        theme === 'light' ? 'bg-[#F5EDED]' : 'bg-[#1c1c24]'
      }`}
    >
      {isLoading && <Loader />} {/* Display loader while request is in progress */}

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex justify-center items-center p-[16px] sm:min-w-[380px] rounded-[10px] ${
          theme === 'light' ? 'bg-[#787A91]' : 'bg-[#3a3a43]'
        }`}
      >
        <h1 className={`font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] ${
          theme === 'light' ? 'text-[#F5EDED]' : 'text-white'
        }`}>
          Start a Campaign
        </h1>
      </motion.div>

      <form onSubmit={handleSubmit} className="w-full mt-[65px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <FormField
            labelName="Your Name *"
            placeholder="John Doe"
            inputType="text"
            value={form.name}
            handleChange={(e) => handleFormFieldChange('name', e)}
          />
          <FormField
            labelName="Campaign Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange('title', e)}
          />
        </div>

        <FormField
          labelName="Story *"
          placeholder="Write your story"
          isTextArea
          value={form.description}
          handleChange={(e) => handleFormFieldChange('description', e)}
        />

        <div className={`w-full flex justify-start items-center p-4 rounded-[10px] ${
          theme === 'light' ? 'bg-[#787A91]' : 'bg-[#8c6dfd]'
        }`}>
          <img src={money} alt="money" className="w-[40px] h-[40px] object-contain" />
          <h4 className={`font-epilogue font-bold text-[25px] ml-[20px] ${
            theme === 'light' ? 'text-[#F5EDED]' : 'text-white'
          }`}>
            You will get 100% of the raised amount
          </h4>
        </div>

        <div className="flex flex-wrap gap-[40px]">
          <FormField
            labelName="Goal *"
            placeholder="ETH 0.50"
            inputType="text"
            value={form.target}
            handleChange={(e) => handleFormFieldChange('target', e)}
          />
          <FormField
            labelName="End Date *"
            placeholder="End Date"
            inputType="date"
            value={form.deadline}
            handleChange={(e) => handleFormFieldChange('deadline', e)}
          />
        </div>

        {/* Display date validation error */}
        {dateError && (
          <p className="text-red-500 text-sm mt-2">{dateError}</p>
        )}

        <FormField
          labelName="Campaign image *"
          placeholder="Place image URL of your campaign"
          inputType="url"
          value={form.image}
          handleChange={(e) => handleFormFieldChange('image', e)}
        />

        {/* Category dropdown */}
        <div className="w-full">
          <label className={`font-semibold text-[16px] uppercase leading-[24px] tracking-wide ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            category *
          </label>
          <select
            value={form.category}
            onChange={(e) => handleFormFieldChange('category', e)}
            className="w-full mt-2 p-3 rounded-lg bg-[#3a3a43] text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8c6dfd] transition-all"
          >
            <option value="" disabled>Select a category</option>
            <option value="art">art</option>
            <option value="technology">technology</option>
            <option value="charity">charity</option>
            <option value="education">education</option>
          </select>
        </div>

        <div className="flex justify-center items-center mt-[40px]">
          <CustomButton
            btnType="submit"
            title="Submit new campaign"
            styles={theme === 'light' ? 'bg-[#787A91] text-[#F5EDED] hover:opacity-90' : 'bg-[#1dc071]'}
          />
        </div>
      </form>
    </motion.div>
  );
};

export default CreateCampaign;