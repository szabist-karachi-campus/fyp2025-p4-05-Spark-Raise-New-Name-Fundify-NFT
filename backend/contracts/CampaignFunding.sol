// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract CampaignFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        address[] donators;
        uint256[] donations;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount;

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline
    ) public {
        require(_deadline > block.timestamp, "Deadline must be in the future");

        Campaign storage newCampaign = campaigns[campaignCount];
        newCampaign.owner = msg.sender;
        newCampaign.title = _title;
        newCampaign.description = _description;
        newCampaign.target = _target;
        newCampaign.deadline = _deadline;
        newCampaign.amountCollected = 0;

        campaignCount++;
    }

    function donateToCampaign(uint256 _id) public payable {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Donation must be greater than zero");

        campaign.donators.push(msg.sender);
        campaign.donations.push(msg.value);
        campaign.amountCollected += msg.value;
    }

    function getDonators(uint256 _id) public view returns (address[] memory, uint256[] memory) {
        Campaign storage campaign = campaigns[_id];
        return (campaign.donators, campaign.donations);
    }

    
}
