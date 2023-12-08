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


    /// @notice Ajoute une adresse à la liste blanche
    /// @dev Seul le propriétaire peut appeler cette fonction
    /// @param investor L'adresse à ajouter à la liste blanche
    function addToWhitelist(address investor) public onlyOwner {
    require(!whitelist[investor], "Investor already whitelisted");
    whitelist[investor] = true;
    emit Whitelisted(investor);
}


    /// @notice Vérifie si une adresse est dans la liste blanche
    /// @param investor L'adresse à vérifier
    /// @return bool Vrai si l'adresse est dans la liste blanche
    function isWhitelisted(address investor) public view returns (bool) {
        return whitelist[investor];
    }

    /// @notice Permet l'achat de tokens pendant l'ICO
    /// @dev Nécessite que l'adresse soit sur la liste blanche et respecte les limites de contribution
    /// @dev La contribution en ETH doit être positive et ne pas dépasser le maximum autorisé
    function buyTokens() public payable {
        require(isWhitelisted(msg.sender), "Address not whitelisted");
        require(msg.value > 0 && msg.value <= s_maxETHContributionIco, "Invalid ETH amount");
        uint256 tokenAmount = msg.value * rate;
        uint256 newTotalSupply = totalSupply() + tokenAmount;
        require(newTotalSupply <= s_maxSupply, "Exceeds max supply");
        _mint(msg.sender, tokenAmount);
    }

    /// @notice Permet l'achat de tokens après l'ICO
    /// @dev La contribution en ETH doit être positive
    function buyTokensAfterIco() public payable {
        //require(block.timestamp >= icoEndTime, "ICO still active");
        require(msg.value > 0, "Invalid ETH amount");
        uint256 tokenAmount = msg.value * rate;
        uint256 newTotalSupply = totalSupply() + tokenAmount;
        require(newTotalSupply <= s_maxSupply, "Exceeds max supply");
        _mint(msg.sender, tokenAmount);
    }


    /// @notice Crée de nouveaux tokens et les attribue à une adresse
    /// @dev Seul le propriétaire peut appeler cette fonction
    /// @param to Adresse qui recevra les nouveaux tokens
    /// @param amount Le montant de tokens à créer
    function mint(address to, uint256 amount) public onlyOwner {
        uint256 newTotalSupply = totalSupply() + amount;
        require(newTotalSupply <= s_maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }

    /// @notice Transfère l'ETH à une adresse spécifiée
    /// @dev Seul l'adresse TimeLock peut appeler cette fonction donc cette fonction ne peux etre appelée que suite à une proposition de vote de la dao.
    /// @param _to Adresse destinataire de l'ETH
    /// @param _amount Montant d'ETH à transférer
    function transferEth(address payable _to, uint256 _amount) public onlyTimeLock {
    require(address(this).balance >= _amount, "Insufficient balance");
    _to.transfer(_amount);
}

    receive() external payable {
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

    /// @notice Définit un nouveau taux de conversion ETH-Token
    /// @dev Seul le propriétaire peut appeler cette fonction
    /// @param newRate Le nouveau taux de conversion
    function setRate(uint256 newRate) public onlyOwner {
        rate = newRate;
    }

    /// @notice Définit une nouvelle adresse TimeLock
    /// @dev Seul le propriétaire peut appeler cette fonction
    /// @param _newTimeLockAddress La nouvelle adresse TimeLock
    function setTimeLockAddress(address _newTimeLockAddress) public onlyOwner {
        require(_newTimeLockAddress != address(0), "Invalid TimeLock address");
        timeLockAddress = _newTimeLockAddress;
    }
}
