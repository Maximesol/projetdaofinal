// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title TargetContract
/// @author Maxime GOGNIES
/// @notice Ce contrat est conçu comme un contrat d'investissement pour une DAO. 
///          Il est destiné à générer des revenus aux membres de la DAO à travers divers investissements dans la DeFi.
///          Ce contrat est actuellement utilisé à des fins de démonstration et n'est pas encore implémenté pour des opérations d'investissement réelles.
/// @dev Hérite de Ownable d'OpenZeppelin pour les contrôles d'accès basés sur la propriété.
/// Il sera utilisé par la Dao et détenu par le TimeLock. Ce qui signifie que seules les propositions approuvées par la DAO pourront être exécutées.
contract TargetContract is Ownable {
  uint256 private value;

  /// @notice Événement émis lorsque la valeur stockée est modifiée
  /// @param newValue La nouvelle valeur stockée
  event ValueChanged(uint256 newValue);

  /// @dev Initialise le contrat avec le créateur du contrat comme propriétaire.
  constructor() Ownable(msg.sender) {}

  /// @notice Stocke une nouvelle valeur dans le contrat
  /// @dev Ne peut être appelé que par le propriétaire du contrat.
  /// @param newValue La valeur à stocker
  function store(uint256 newValue) public onlyOwner {
    value = newValue;
    emit ValueChanged(newValue);
  }

  /// @notice Récupère la dernière valeur stockée
  /// @return La dernière valeur stockée
  function retrieve() public view returns (uint256) {
    return value;
  }

  /// @notice Fonction pour recevoir de l'ETH
  receive() external payable {}

  /// @notice Fallback function
  fallback() external payable {}
}
