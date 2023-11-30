// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract TokenGouv is ERC20, Ownable, ERC20Permit, ERC20Votes {

    event Whitelisted(address investor);
    address public timeLockAddress;


    uint256 public constant s_maxSupply = 1000000 * 10**18;
    uint256 public constant s_maxETHContributionIco = 10 ether;
    uint256 public rate = 5000; // 1 ETH = 5000 TokenGouv (ICO), after we can change it
    //uint256 public icoStartTime;
    //uint256 public icoEndTime;
    mapping(address => bool) private whitelist;

    // modifier qui accepte uniquement les appels de l'addresse de verouillage TimeLock
    modifier onlyTimeLock() {
        require(msg.sender == timeLockAddress, "Caller is not TimeLock");
        _;
    }

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

    function isWhitelisted(address investor) public view returns (bool) {
        return whitelist[investor];
    }

    // buyTokens during ICO
    function buyTokens() public payable {
        //require(block.timestamp >= icoStartTime && block.timestamp <= icoEndTime, "ICO not active");
        require(isWhitelisted(msg.sender), "Address not whitelisted");
        require(msg.value > 0 && msg.value <= s_maxETHContributionIco, "Invalid ETH amount");
        uint256 tokenAmount = msg.value * rate;
        uint256 newTotalSupply = totalSupply() + tokenAmount;
        require(newTotalSupply <= s_maxSupply, "Exceeds max supply");
        _mint(msg.sender, tokenAmount);
    }

    // buyTokens after ICO
    function buyTokensAfterIco() public payable {
        //require(block.timestamp >= icoEndTime, "ICO still active");
        require(msg.value > 0, "Invalid ETH amount");
        uint256 tokenAmount = msg.value * rate;
        uint256 newTotalSupply = totalSupply() + tokenAmount;
        require(newTotalSupply <= s_maxSupply, "Exceeds max supply");
        _mint(msg.sender, tokenAmount);
    }


    function mint(address to, uint256 amount) public onlyOwner {
        uint256 newTotalSupply = totalSupply() + amount;
        require(newTotalSupply <= s_maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }
    function transferEth(address payable _to, uint256 _amount) public onlyTimeLock {
    require(address(this).balance >= _amount, "Insufficient balance");
    _to.transfer(_amount);
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

    function setRate(uint256 newRate) public onlyOwner {
        rate = newRate;
    }
    function setTimeLockAddress(address _newTimeLockAddress) public onlyOwner {
        require(_newTimeLockAddress != address(0), "Invalid TimeLock address");
        timeLockAddress = _newTimeLockAddress;
    }
}
