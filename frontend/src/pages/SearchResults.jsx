import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import NFTFund from "../contracts/NFTFund.json";
import FundCard from "../components/FundCard"; // Import FundCard

const contractAddress = "0x17BB689411c1032396a2dB0f0aFB2c6b34939C0a";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("q");

  useEffect(() => {
    if (!searchQuery) {
      setResults([]);
      setLoading(false);
      return;
    }
    fetchData(searchQuery);
  }, [searchQuery]);

  const fetchData = async (query) => {
    setLoading(true);
    try {
      const [campaigns, nfts] = await Promise.all([
        fetchCampaigns(query),
        fetchNFTs(query),
      ]);
      setResults([...campaigns, ...nfts]); 
    } catch (error) {
      console.error("Error fetching data:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async (query) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data.map((item) => ({ ...item, type: "campaign" })) : [];
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
  };

  const fetchNFTs = async (query) => {
    try {
      if (!window.ethereum) return [];
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, NFTFund.abi, provider);
      const totalNFTs = await contract.tokenCounter();
      const results = [];

      for (let i = 0; i < totalNFTs; i++) {
        try {
          const [tokenURI, price, owner, forSale] = await contract.getNFTDetails(i);
          const metadataRes = await fetch(tokenURI);
          if (!metadataRes.ok) continue;

          const metadata = await metadataRes.json();
          if (!metadata.name || !metadata.image) continue;

          if (
            metadata.name.toLowerCase().includes(query.toLowerCase()) ||
            metadata.description.toLowerCase().includes(query.toLowerCase())
          ) {
            results.push({
              id: i,
              type: "nft",
              name: metadata.name,
              description: metadata.description,
              image: metadata.image,
              price: ethers.utils.formatEther(price),
              owner,
              forSale,
            });
          }
        } catch (error) {
          console.error(`Error fetching NFT at index ${i}:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      return [];
    }
  };

  const handleCardClick = (id) => {
    navigate(`/campaign-details/${id}`); // Redirects to campaign details page
  };

  return (
    <div className="p-6 border-[#3a3a43] min-h-screen text-white">
      <h2 className="text-2xl font-semibold">
        Search Results for "{searchQuery}"
      </h2>

      {loading ? (
        <p className="mt-4 text-gray-400">Loading results...</p>
      ) : results.length === 0 ? (
        <p className="mt-4 text-gray-400">No results found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) =>
            item.type === "campaign" ? (
              <FundCard
                key={item._id}
                id={item._id}
                owner={item.owner}
                title={item.title}
                description={item.description}
                target={item.target}
                deadline={item.deadline}
                amountCollected={item.amountCollected}
                image={item.image}
                likes={item.likes}
                liked={false} // Modify this if you track user likes
                handleClick={() => handleCardClick(item._id)}
              />
            ) : (
              <div
              key={item.id}
              className="bg-[#2c2f32] p-4 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => navigate(`/nft/${item.id}`)} // Navigate to NFTDetails page
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover rounded-md"
              />
              <h3 className="text-xl mt-2">{item.name}</h3>
              <p className="text-sm text-gray-400">{item.description}</p>
              <p className="text-green-400 mt-1">Price: {item.price} ETH</p>
              <p className="text-sm text-gray-500">Owner: {item.owner}</p>
            </div>
            
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
