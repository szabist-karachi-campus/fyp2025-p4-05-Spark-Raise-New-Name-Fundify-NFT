// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTFund is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;
    uint256 public rewardTokenCounter;
    uint256 public constant nftThreshold = 3; // Number of NFTs required for a reward token

    struct NFT {
        uint256 id;
        address payable owner;
        uint256 price;
        bool forSale;
    }

    mapping(uint256 => NFT) public nfts;
    mapping(address => uint256) public userNFTCount;
    mapping(address => bool) public hasReceivedToken;

    event NFTCreated(address indexed owner, uint256 indexed tokenId, string tokenURI, uint256 price);
    event NFTPurchased(address indexed previousOwner, address indexed newOwner, uint256 indexed tokenId, uint256 price);
    event RewardTokenIssued(address indexed recipient, uint256 rewardTokenId);
    event RewardTokenClaimed(address indexed recipient, uint256 rewardTokenId);

    constructor() ERC721("FundifyNFT", "FUNDNFT") Ownable(msg.sender) {
        tokenCounter = 0;
        rewardTokenCounter = 10000; // Separate counter for reward tokens
    }

    // Create NFT and list it for sale
    function createNFT(string memory _tokenURI, uint256 price) public payable returns (uint256) {
        require(price > 0, "Price must be greater than zero");

        uint256 newTokenId = tokenCounter;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        nfts[newTokenId] = NFT(newTokenId, payable(msg.sender), price, true);

        emit NFTCreated(msg.sender, newTokenId, _tokenURI, price);
        tokenCounter++;
        return newTokenId;
    }

    // Buy NFT and transfer ownership
    function buyNFT(uint256 tokenId) public payable {
        NFT storage nft = nfts[tokenId];
        require(nft.forSale, "NFT is not for sale");
        require(msg.value >= nft.price, "Insufficient payment");
        require(nft.owner != msg.sender, "You already own this NFT");

        // Transfer payment to seller
        nft.owner.transfer(msg.value);

        // Transfer NFT ownership
        _transfer(nft.owner, msg.sender, tokenId);

        // Update ownership and remove from sale
        nft.owner = payable(msg.sender);
        nft.forSale = false;

        // Track NFT purchases
        userNFTCount[msg.sender]++;

        emit NFTPurchased(nft.owner, msg.sender, tokenId, msg.value);
    }

    // Claim a reward token manually
    function claimToken() public {
        require(userNFTCount[msg.sender] >= nftThreshold, "You need at least 3 NFTs to claim");
        require(!hasReceivedToken[msg.sender], "You have already claimed your reward token");

        uint256 rewardTokenId = rewardTokenCounter;
        _safeMint(msg.sender, rewardTokenId);
        _setTokenURI(rewardTokenId, "Unique Reward Token URI");
        hasReceivedToken[msg.sender] = true;

        emit RewardTokenClaimed(msg.sender, rewardTokenId);
        rewardTokenCounter++;
    }
  event CampaignFunded(address indexed campaignOwner, address indexed funder, uint256 amount);

     // ✅ Create a function to fund campaigns
    function fundCampaign(address payable campaignOwner) public payable {
        require(msg.value > 0, "Donation must be greater than zero");
        require(campaignOwner != address(0), "Invalid campaign owner address");

        campaignOwner.transfer(msg.value); // Send funds directly to campaign owner

        emit CampaignFunded(campaignOwner, msg.sender, msg.value);
    } 


    // Check if user is eligible for a reward
    function checkEligibility(address user) external view returns (bool) {
        return (userNFTCount[user] >= nftThreshold && !hasReceivedToken[user]);
    }

    // Set NFT for sale
    function setForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Only owner can sell");
        require(price > 0, "Price must be greater than zero");

        NFT storage nft = nfts[tokenId];
        nft.forSale = true;
        nft.price = price;
    }

    // Get NFT details
    function getNFTDetails(uint256 tokenId) public view returns (string memory, uint256, address, bool) {
        NFT storage nft = nfts[tokenId];
        return (tokenURI(tokenId), nft.price, nft.owner, nft.forSale);
    }

    // Withdraw contract balance (only owner)
    function withdrawFunds() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }




    receive() external payable {}
}
