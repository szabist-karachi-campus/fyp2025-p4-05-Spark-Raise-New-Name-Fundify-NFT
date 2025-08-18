import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import NFTFund from "../contracts/NFTFund.json";

const contractAddress = "0x17BB689411c1032396a2dB0f0aFB2c6b34939C0a";

const NFTList = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eligibleForReward, setEligibleForReward] = useState(false);
  const [claimingReward, setClaimingReward] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("image");
  const [playingId, setPlayingId] = useState(null);

  const navigate = useNavigate();
  const audioRefs = useRef({});

  useEffect(() => {
    fetchNFTs();
    checkRewardEligibility();
  }, []);

  const fetchNFTs = async () => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask is not installed!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, NFTFund.abi, provider);

      const totalNFTs = await contract.tokenCounter();
      const totalNFTCount = totalNFTs.toNumber();

      let nftData = [];

      for (let i = 0; i < totalNFTCount; i++) {
        const [tokenURI, price, owner, forSale] = await contract.getNFTDetails(i);

        if (!tokenURI) continue;

        const metadataRes = await fetch(tokenURI);
        if (!metadataRes.ok) continue;

        const metadata = await metadataRes.json();
        const category = metadata.category || "image";

        nftData.push({
          id: i,
          name: metadata.name || "Unknown",
          description: metadata.description || "No description",
          image: metadata.image || metadata.music || "",
          price: ethers.utils.formatEther(price),
          owner,
          forSale,
          category,
        });
      }

      setNfts(nftData);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkRewardEligibility = async () => {
    try {
      if (!window.ethereum) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      const contract = new ethers.Contract(contractAddress, NFTFund.abi, provider);
      const isEligible = await contract.checkEligibility(userAddress);

      setEligibleForReward(isEligible);
    } catch (error) {
      console.error("Error checking reward eligibility:", error);
    }
  };

  const claimRewardToken = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected!");
        return;
      }

      setClaimingReward(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, NFTFund.abi, signer);

      const tx = await contract.claimToken();
      await tx.wait();

      alert("🎉 Reward token claimed successfully!");
      setEligibleForReward(false);
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("Failed to claim reward token.");
    } finally {
      setClaimingReward(false);
    }
  };

  const buyNFT = async (tokenId, price) => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, NFTFund.abi, signer);

      const tx = await contract.buyNFT(tokenId, {
        value: ethers.utils.parseEther(price),
      });

      await tx.wait();
      alert("NFT purchased successfully!");

      fetchNFTs();
      checkRewardEligibility();
    } catch (error) {
      console.error("Transaction failed", error);
      alert("Transaction failed!");
    }
  };

  return (
    <div className="h-screen w-full bg-[#f5eded] dark:bg-[#13131a]">
      <div className="min-h-screen px-6 py-10 bg-[#F5EDED] dark:bg-[#1c1c24]">
        <h2 className="text-3xl font-bold text-center mb-6 text-black dark:text-white">
          Explore NFTs
        </h2>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setSelectedCategory("image")}
            className={`px-4 py-2 rounded-lg font-semibold ${selectedCategory === "image" ? "bg-blue-600 text-white" : "bg-gray-300 text-black"}`}
          >
            Image NFTs
          </button>
          <button
            onClick={() => setSelectedCategory("music")}
            className={`px-4 py-2 rounded-lg font-semibold ${selectedCategory === "music" ? "bg-blue-600 text-white" : "bg-gray-300 text-black"}`}
          >
            Music NFTs
          </button>
        </div>

        {eligibleForReward && (
          <div className="bg-green-600 text-white text-center py-3 rounded-lg mb-6 flex flex-col items-center">
            🎉 Congratulations! You are eligible for a reward token!
            <button
              className={`mt-3 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-semibold transition ${claimingReward ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={claimRewardToken}
              disabled={claimingReward}
            >
              {claimingReward ? "Claiming..." : "Claim Your Reward"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-400">Loading NFTs...</p>
        ) : nfts.filter(nft => nft.category === selectedCategory).length === 0 ? (
          <p className="text-center text-gray-400">No NFTs available for this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nfts
              .filter(nft => nft.category === selectedCategory)
              .map((nft) => (
                <div
                  key={nft.id}
                  className="bg-[#1e1e1e] p-5 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer transform hover:scale-105"
                  onClick={() => navigate(`/nft/${nft.id}`)}
                >
                  {nft.category === "music" ? (
                    <div className="w-full h-52 bg-gray-900 rounded-lg flex flex-col items-center justify-center px-2 relative">
                      <p className="text-white font-semibold mb-2 truncate">{nft.name}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          Object.keys(audioRefs.current).forEach((key) => {
                            if (key !== nft.id.toString() && audioRefs.current[key]) {
                              audioRefs.current[key].pause();
                            }
                          });
                          const audio = audioRefs.current[nft.id];
                          if (audio) {
                            if (playingId === nft.id) {
                              audio.pause();
                              setPlayingId(null);
                            } else {
                              audio.play();
                              setPlayingId(nft.id);
                            }
                          }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        {playingId === nft.id ? "Pause" : "Play"}
                      </button>
                      <audio
                        ref={(el) => (audioRefs.current[nft.id] = el)}
                        src={nft.image}
                        onEnded={() => setPlayingId(null)}
                      />
                    </div>
                  ) : (
                    nft.image ? (
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-52 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-52 bg-gray-700 rounded-lg flex items-center justify-center">
                        <p className="text-gray-400">No Image</p>
                      </div>
                    )
                  )}

                  <div className="mt-4">
                    <h3 className="text-lg font-semibold truncate">{nft.name}</h3>
                    <p className="text-gray-400 text-sm truncate">{nft.description}</p>
                    <p className="mt-2 text-green-400 font-bold">{nft.price} MATIC</p>

                    {nft.forSale ? (
                      <button
                        className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          buyNFT(nft.id, nft.price);
                        }}
                      >
                        Buy Now
                      </button>
                    ) : (
                      <p className="mt-3 text-red-500 font-bold text-center">Sold</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTList;
