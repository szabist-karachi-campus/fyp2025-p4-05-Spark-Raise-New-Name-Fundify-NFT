import React, { useState, useEffect } from "react";
import { useStateContext } from "../context/StateContext";
import { ethers } from "ethers";
import NFTFund from "../contracts/NFTFund.json";
import axios from 'axios';

const contractAddress = "0x17BB689411c1032396a2dB0f0aFB2c6b34939C0a";

const Profile = () => {
  const { theme, address } = useStateContext();
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    photo: null,
    photoUrl: ""
  });
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch profile info from backend
  useEffect(() => {
    if (!address) return;
    setLoading(true);
    axios.get(`/api/profile/${address}`)
      .then(res => {
        setProfile(prev => ({ ...prev, name: res.data.name || '', bio: res.data.bio || '' }));
      })
      .catch(() => {
        setProfile(prev => ({ ...prev, name: '', bio: '' }));
      })
      .finally(() => setLoading(false));
  }, [address]);

  // Handle profile input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile info to backend
  const handleSave = async (e) => {
    e.preventDefault();
    if (!address) return;
    setSaving(true);
    setSuccess(false);
    try {
      await axios.post('/api/profile', {
        wallet: address,
        name: profile.name,
        bio: profile.bio
      });
      setSuccess(true);
    } catch (err) {
      // Optionally show error
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  // Handle profile photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setProfile((prev) => ({ ...prev, photo: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch user's NFTs
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

  return (
    <div className={`min-h-screen py-10 px-4 flex flex-col items-center ${theme === 'light' ? 'bg-[#F5EDED]' : 'bg-[#13131a]'}`}>
      <div className={`w-full max-w-xl p-8 rounded-lg shadow-md mb-10 ${theme === 'light' ? 'bg-white' : 'bg-[#1c1c24]'}`}>
        <h2 className={`text-2xl font-bold mb-6 text-center ${theme === 'light' ? 'text-[#2B2B2B]' : 'text-white'}`}>Profile Info</h2>
        <form className="flex flex-col gap-5 items-center" onSubmit={handleSave}>
          <div className="flex flex-col items-center gap-2">
            <label htmlFor="profilePhoto" className="cursor-pointer">
              <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center overflow-hidden ${theme === 'light' ? 'border-[#787A91] bg-[#E8E8E8]' : 'border-[#787A91] bg-[#23232b]'}`}> 
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt="Profile" className="object-cover w-full h-full" />
                ) : (
                  <span className={`text-4xl ${theme === 'light' ? 'text-[#787A91]' : 'text-[#8c6dfd]'}`}>+</span>
                )}
              </div>
              <input id="profilePhoto" type="file" accept="image/*" className="hidden" disabled />
            </label>
            <span className={`text-xs ${theme === 'light' ? 'text-[#787A91]' : 'text-[#8c6dfd]'}`}>Upload Profile Photo (coming soon)</span>
          </div>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={profile.name}
            onChange={handleChange}
            className={`w-full p-3 rounded-lg border outline-none ${theme === 'light' ? 'bg-[#F5EDED] text-[#2B2B2B] border-[#787A91] placeholder:text-[#787A91]' : 'bg-[#23232b] text-white border-[#3a3a43] placeholder:text-[#8c6dfd]'}`}
            disabled={loading}
          />
          <textarea
            name="bio"
            placeholder="Your Bio"
            value={profile.bio}
            onChange={handleChange}
            rows={3}
            className={`w-full p-3 rounded-lg border outline-none resize-none ${theme === 'light' ? 'bg-[#F5EDED] text-[#2B2B2B] border-[#787A91] placeholder:text-[#787A91]' : 'bg-[#23232b] text-white border-[#3a3a43] placeholder:text-[#8c6dfd]'}`}
            disabled={loading}
          />
          <button
            type="submit"
            className={`mt-2 px-6 py-2 rounded-lg font-semibold ${theme === 'light' ? 'bg-[#4ADE80] text-[#2B2B2B]' : 'bg-[#4ADE80] text-[#13131a]'} transition-colors duration-200 disabled:opacity-60`}
            disabled={loading || saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {success && <span className="text-green-500 mt-2">Profile saved!</span>}
        </form>
      </div>
      <div className="w-full max-w-6xl">
        <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-[#2B2B2B]' : 'text-white'}`}>Your NFTs</h2>
        {(!address || nfts.length === 0) ? (
          <p className={`text-center ${theme === 'light' ? 'text-[#787A91]' : 'text-[#8c6dfd]'}`}>You don't own any NFTs.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <div
                key={nft.id}
                className={`border rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1 cursor-pointer ${theme === 'light' ? 'border-[#787A91] bg-[#F5EDED]' : 'border-gray-600 bg-[#1e1e1e]'}`}
              >
                {nft.image ? (
                  <img src={nft.image} alt={nft.name} className="w-full h-60 object-cover" />
                ) : (
                  <div className="h-60 flex items-center justify-center bg-gray-700">
                    <p className="text-gray-400">No Image Available</p>
                  </div>
                )}
                <div className="p-4">
                  <h3 className={`text-lg font-bold ${theme === 'light' ? 'text-[#2B2B2B]' : 'text-white'}`}>{nft.name}</h3>
                  <p className={`text-sm ${theme === 'light' ? 'text-[#787A91]' : 'text-gray-300'}`}>{nft.description}</p>
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
    </div>
  );
};

export default Profile;
