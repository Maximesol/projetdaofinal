// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/// @title TokenGouv 
/// @author Maxime GOGNIES
/// @notice TokenGouv is a ERC20 token with vote and permit features, which inherits ERC20, Ownable, ERC20Permit, ERC20Votes

contract TokenGouv is ERC20, Ownable, ERC20Permit, ERC20Votes {

    event Whitelisted(address investor);
    address public timeLockAddress;


    uint256 public constant s_maxSupply = 1000000 * 10**18;
    uint256 public constant s_maxETHContributionIco = 10 ether;
    uint256 public rate = 5000; // 1 ETH = 5000 TokenGouv (ICO), after we can change it
    mapping(address => bool) private whitelist;

    modifier onlyTimeLock() {
        require(msg.sender == timeLockAddress, "Caller is not TimeLock");
        _;
    }

    constructor(address initialOwner)
        ERC20("TokenGouv", "DCP")
        Ownable(initialOwner)
        ERC20Permit("TokenGouv")
    {}


    /// @notice Add address to whitelist
    /// @dev Only owner can call this function
    /// @param investor The address to add to the whitelist
    function addToWhitelist(address investor) public onlyOwner {
    require(!whitelist[investor], "Investor already whitelisted");
    whitelist[investor] = true;
    emit Whitelisted(investor);
}


    /// @notice Verify if an address is whitelisted
    /// @param investor The address to verify
    /// @return bool True if the address is whitelisted, false otherwise
    function isWhitelisted(address investor) public view returns (bool) {
        return whitelist[investor];
    }

    /// @notice Autorise buying tokens during the ICO
    /// @dev Requires address to be whitelisted and meets contribution limits
    /// @dev The ETH contribution must be positive and not exceed the maximum allowed
    function buyTokens() public payable {
        require(isWhitelisted(msg.sender), "Address not whitelisted");
        require(msg.value > 0 && msg.value <= s_maxETHContributionIco, "Invalid ETH amount");
        uint256 tokenAmount = msg.value * rate;
        uint256 newTotalSupply = totalSupply() + tokenAmount;
        require(newTotalSupply <= s_maxSupply, "Exceeds max supply");
        _mint(msg.sender, tokenAmount);
    }

    /// @notice Allows the purchase of tokens after the ICO
    /// @dev The ETH contribution must be positive
    function buyTokensAfterIco() public payable {
        require(msg.value > 0, "Invalid ETH amount");
        uint256 tokenAmount = msg.value * rate;
        uint256 newTotalSupply = totalSupply() + tokenAmount;
        require(newTotalSupply <= s_maxSupply, "Exceeds max supply");
        _mint(msg.sender, tokenAmount);
    }


    /// @notice Creates new tokens and assigns them to an address
    /// @dev Only the owner can call this function
    /// @param to The address to which the tokens will be assigned
    /// @param amount The amount of tokens to be created
    function mint(address to, uint256 amount) public onlyOwner {
        uint256 newTotalSupply = totalSupply() + amount;
        require(newTotalSupply <= s_maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }

    /// @notice Transfers ETH to a specified address
    /// @dev Only the TimeLock address can call this function so this function can only be called following a voting proposal from the dao.
    /// @param _to ETH recipient address
    /// @param _amount ETH amount to transfer
    function transferEth(address payable _to, uint256 _amount) public onlyTimeLock {
    require(address(this).balance >= _amount, "Insufficient balance");
    _to.transfer(_amount);
}

    receive() external payable {
    }

    // Override functions from ERC20Votes

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

    /// @notice Sets a new ETH-Token conversion rate
    /// @dev Only the owner can call this function
    /// @param newRate The new conversion rate
    function setRate(uint256 newRate) public onlyOwner {
        rate = newRate;
    }

    /// @notice Sets a new TimeLock address
    /// @dev Only the owner can call this function
    /// @param _newTimeLockAddress  The new TimeLock address
    function setTimeLockAddress(address _newTimeLockAddress) public onlyOwner {
        require(_newTimeLockAddress != address(0), "Invalid TimeLock address");
        timeLockAddress = _newTimeLockAddress;
    }
}
