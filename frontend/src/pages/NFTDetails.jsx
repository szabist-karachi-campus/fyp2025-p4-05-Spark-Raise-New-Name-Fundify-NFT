import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import NFTFund from "../contracts/NFTFund.json";

const contractAddress = "0x17BB689411c1032396a2dB0f0aFB2c6b34939C0a";

const NFTDetails = () => {
  const { id } = useParams();
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchNFTDetails();
  }, []);

  const fetchNFTDetails = async () => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask not installed!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, NFTFund.abi, provider);

      const nftId = parseInt(id, 10);
      if (isNaN(nftId)) {
        console.error("Invalid NFT ID:", id);
        return;
      }

      const [tokenURI, price, owner, forSale] = await contract.getNFTDetails(nftId);

      if (!tokenURI) {
        console.warn(`NFT ${nftId} has an invalid tokenURI`);
        return;
      }

      const metadataRes = await fetch(tokenURI);
      if (!metadataRes.ok) throw new Error(`Failed to fetch metadata: ${metadataRes.status}`);

      const metadata = await metadataRes.json();

      const category = metadata.category || "image";
      const mediaUrl = category === "music" ? metadata.music : metadata.image;

      setNft({
        id: nftId,
        name: metadata.name || "Unknown",
        description: metadata.description || "No description",
        media: mediaUrl || "",
        category,
        price: ethers.utils.formatEther(price),
        owner,
        forSale,
      });
    } catch (error) {
      console.error("Error fetching NFT details:", error);
    } finally {
      setLoading(false);
    }
  };

  const buyNFT = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected!");
        return;
      }

      setBuying(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, NFTFund.abi, signer);

      const formattedPrice = ethers.utils.parseEther(nft.price.toString());
      const tx = await contract.buyNFT(nft.id, { value: formattedPrice });

      await tx.wait();
      alert("NFT purchased successfully!");
      fetchNFTDetails();
    } catch (error) {
      console.error("Transaction failed", error);
      alert("Transaction failed!");
    } finally {
      setBuying(false);
    }
  };

  const handlePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  if (loading)
    return <p className="text-gray-400 text-center text-lg mt-10">Loading NFT details...</p>;

  if (!nft)
    return <p className="text-gray-400 text-center text-lg mt-10">NFT not found.</p>;

  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <div className="max-w-lg w-full bg-[#1e1e1e] shadow-lg rounded-2xl p-6 text-white">
        <h2 className="text-3xl font-semibold text-center">{nft.name}</h2>

        {nft.category === "music" ? (
          <div className="w-full h-64 bg-gray-800 rounded-xl mt-4 flex flex-col items-center justify-center">
            <button
              onClick={handlePlay}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow"
            >
              {playing ? "Pause Music" : "Play Music"}
            </button>
            <audio
              ref={audioRef}
              src={nft.media}
              onEnded={() => setPlaying(false)}
            />
          </div>
        ) : nft.media ? (
          <img
            src={nft.media}
            alt={nft.name}
            className="w-full h-64 object-cover rounded-xl mt-4 shadow-md"
          />
        ) : (
          <div className="h-64 flex items-center justify-center bg-gray-700 rounded-xl mt-4">
            <p className="text-gray-400">No Media Available</p>
          </div>
        )}

        <p className="mt-4 text-gray-300 text-center">{nft.description}</p>

        <div className="mt-4 flex flex-col gap-2">
          <p className="text-lg font-semibold text-gray-400">
            Price: <span className="text-green-400">{nft.price} MATIC</span>
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Owner:</span> {nft.owner}
          </p>
        </div>

        {nft.forSale ? (
          <button
            className={`mt-6 w-full text-white font-semibold p-3 rounded-xl transition-all duration-300 ${
              buying
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg"
            }`}
            onClick={buyNFT}
            disabled={buying}
          >
            {buying ? "Processing..." : "Buy Now"}
          </button>
        ) : (
          <p className="mt-6 text-red-500 font-bold text-center text-lg">Sold</p>
        )}
      </div>
    </div>
  );
};

export default NFTDetails;
