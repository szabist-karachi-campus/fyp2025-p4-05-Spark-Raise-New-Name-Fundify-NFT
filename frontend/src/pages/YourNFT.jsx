import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../context/StateContext";
import { ethers } from "ethers";
import NFTFund from "../contracts/NFTFund.json";

const contractAddress = "0x17BB689411c1032396a2dB0f0aFB2c6b34939C0a";

export default function YourNFTs() {
  const { address } = useStateContext();
  const [nfts, setNfts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!address) return;

    const fetchYourNFTs = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, NFTFund.abi, provider);

        const totalNFTs = await contract.tokenCounter();
        const totalNFTCount = totalNFTs.toNumber();

        let ownedNFTs = [];

        for (let i = 0; i < totalNFTCount; i++) {
          const [tokenURI, price, owner, forSale] = await contract.getNFTDetails(i);

          if (owner.toLowerCase() === address.toLowerCase()) {
            const metadataRes = await fetch(tokenURI);
            if (!metadataRes.ok) continue;

            const metadata = await metadataRes.json();

            ownedNFTs.push({
              id: i,
              name: metadata.name || "Unknown",
              description: metadata.description || "No description",
              image: metadata.image || "",
              price: ethers.utils.formatEther(price),
              owner,
              forSale,
            });
          }
        }

        setNfts(ownedNFTs);
      } catch (error) {
        console.error("Error fetching your NFTs:", error);
      }
    };

    fetchYourNFTs();
  }, [address]);

  if (!address)
    return (
      <p className="text-gray-700 text-lg text-center mt-10">
        Connect your wallet to see your NFTs.
      </p>
    );

  return (
    <div className="min-h-screen container mx-auto px-6 mt-10 bg-[#F5EDED] dark:bg-[#1c1c24]">
      <h2 className="text-3xl font-semibold mb-6 text-black dark:text-white">Your NFTs</h2>

      {nfts.length === 0 ? (
        <p className="text-black dark:text-white">You don't own any NFTs.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <div
              key={nft.id}
              className="border border-gray-600 rounded-xl shadow-md bg-[#1e1e1e] overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate(`/nft/${nft.id}`, { state: nft })}
            >
              {nft.image ? (
                <img src={nft.image} alt={nft.name} className="w-full h-60 object-cover" />
              ) : (
                <div className="h-60 flex items-center justify-center bg-gray-700">
                  <p className="text-gray-400">No Image Available</p>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-bold text-white">{nft.name}</h3>
                <p className="text-sm text-gray-300">{nft.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-green-400 font-semibold">{nft.price} MATIC</span>
                  {nft.forSale ? (
                    <span className="text-sm text-blue-400 font-semibold">For Sale</span>
                  ) : (
                    <span className="text-sm text-red-400 font-semibold">Not For Sale</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
