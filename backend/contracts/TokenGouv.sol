// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract TokenGouv is ERC20, Ownable, ERC20Permit, ERC20Votes {

    event Whitelisted(address investor);


    uint256 public constant s_maxSupply = 1000000 * 10**18;
    uint256 public constant s_maxETHContributionIco = 10 ether;
    uint256 public rateIco = 5000;
    //uint256 public icoStartTime;
    //uint256 public icoEndTime;
    mapping(address => bool) private whitelist;

    constructor(address initialOwner)
        ERC20("TokenGouv", "DCP")
        Ownable(initialOwner)
        ERC20Permit("TokenGouv")
    {}

    function addToWhitelist(address investor) public onlyOwner {
    require(!whitelist[investor], "Investor already whitelisted");
    whitelist[investor] = true;
    emit Whitelisted(investor);
}

    function removeFromWhitelist(address investor) public onlyOwner {
        whitelist[investor] = false;
    }

    function isWhitelisted(address investor) public view returns (bool) {
        return whitelist[investor];
    }

    function buyTokens() public payable {
        //require(block.timestamp >= icoStartTime && block.timestamp <= icoEndTime, "ICO not active");
        require(isWhitelisted(msg.sender), "Address not whitelisted");
        require(msg.value > 0 && msg.value <= s_maxETHContributionIco, "Invalid ETH amount");
        uint256 tokenAmount = msg.value * rateIco;
        uint256 newTotalSupply = totalSupply() + tokenAmount;
        require(newTotalSupply <= s_maxSupply, "Exceeds max supply");
        _mint(msg.sender, tokenAmount);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        uint256 newTotalSupply = totalSupply() + amount;
        require(newTotalSupply <= s_maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }

    receive() external payable {
        // Logique pour la gestion des Ethers reçus, par exemple transfert à une adresse de trésorerie
    }

    // Overrides requis par Solidity

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }

    function setIcoRate(uint256 newRate) public onlyOwner {
        rateIco = newRate;
    }
}
