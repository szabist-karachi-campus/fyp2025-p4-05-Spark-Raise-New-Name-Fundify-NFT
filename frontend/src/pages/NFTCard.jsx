import React from "react";

const NFTCard = ({ nft, onClick }) => {
  return (
    <div
      className="p-4 border rounded bg-gray-800 text-white cursor-pointer transition transform hover:scale-105"
      onClick={onClick}
    >
      <h3 className="text-lg font-bold">{nft.name}</h3>
      {nft.image ? (
        <img src={nft.image} alt={nft.name} className="w-full h-40 object-cover mt-2 rounded" />
      ) : (
        <p className="text-gray-400">No Image Available</p>
      )}
      <p className="mt-2">Price: {nft.price} MATIC</p>
      {nft.forSale ? (
        <p className="text-green-400 mt-2">Available for Sale</p>
      ) : (
        <p className="text-red-400 mt-2">Not for Sale</p>
      )}
    </div>
  );
};

export default NFTCard;
