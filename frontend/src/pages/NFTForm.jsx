import React, { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import NFTFundData from "../contracts/NFTFund.json";
import { useStateContext } from "../context/StateContext";

const abi = NFTFundData.abi;
const contractAddress = "0x17BB689411c1032396a2dB0f0aFB2c6b34939C0a";

const NFTForm = () => {
  const navigate = useNavigate();
  const { theme } = useStateContext();

  const [nftType, setNftType] = useState("image"); // "image" or "music"
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file: null,
    fundingAmount: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, file });
  };

  const uploadToIPFS = async (file) => {
    const data = new FormData();
    data.append("file", file);

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: "85d9616c218367e25510",
        pinata_secret_api_key: "17633a7ebd1847e597229fc558a8317628139edf068688808e4ffe1b594ef965",
      },
      body: data,
    });

    const result = await response.json();
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.file) {
        alert("Please upload a file.");
        setLoading(false);
        return;
      }

      const fileUrl = await uploadToIPFS(formData.file);

      const metadata = {
  name: formData.name,
  description: formData.description,
  image: nftType === "image" ? fileUrl : "",
  music: nftType === "music" ? fileUrl : "",
  category: nftType,
};

      const metadataResponse = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: "85d9616c218367e25510",
          pinata_secret_api_key: "17633a7ebd1847e597229fc558a8317628139edf068688808e4ffe1b594ef965",
        },
        body: JSON.stringify(metadata),
      });

      const metadataResult = await metadataResponse.json();
      const tokenURI = `https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const txn = await contract.createNFT(tokenURI, ethers.utils.parseEther(formData.fundingAmount));
      await txn.wait();

      alert("NFT created successfully!");
      navigate("/nft-form");
    } catch (error) {
      console.error("Error creating NFT:", error);
      alert("Error creating NFT. See console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`h-screen w-full bg-[#f5eded] dark:bg-[#13131a] flex items-center justify-center`}>
      <div
        className={`p-6 rounded-lg w-full max-w-md mx-auto ${
          theme === 'light' ? 'bg-[#F5EDED]' : 'bg-[#1c1c24]'
        }`}
      >
        <h2 className={`text-xl font-semibold ${theme === 'light' ? 'text-[#2B2B2B]' : 'text-white'}`}>Create NFT</h2>

        {/* Toggle Buttons */}
        <div className="flex gap-2 my-4">
          <button
            type="button"
            onClick={() => setNftType("image")}
            className={`px-4 py-2 rounded ${nftType === "image" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          >
            Image NFT
          </button>
          <button
            type="button"
            onClick={() => setNftType("music")}
            className={`px-4 py-2 rounded ${nftType === "music" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          >
            Music NFT
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="NFT Name"
            value={formData.name}
            onChange={handleInputChange}
            className="p-2 w-full rounded border outline-none"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            className="p-2 w-full rounded border outline-none"
            required
          />

          {/* File Upload Field (dynamic) */}
          <input
            type="file"
            accept={nftType === "image" ? "image/*" : "audio/*"}
            onChange={handleFileUpload}
            className="p-2 w-full rounded border outline-none"
            required
          />

          <input
            type="number"
            name="fundingAmount"
            placeholder="Funding Amount (MATIC)"
            value={formData.fundingAmount}
            onChange={handleInputChange}
            className="p-2 w-full rounded border outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="p-2 w-full rounded font-semibold bg-blue-600 text-white"
          >
            {loading ? "Creating NFT..." : `Create ${nftType === "image" ? "Image" : "Music"} NFT`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NFTForm;
