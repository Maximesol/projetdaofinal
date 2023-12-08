// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/TimelockController.sol";


//// @title TimeLock
/// @author Maxime GOGNIES
/// @notice Ce contrat implémente un contrôleur de verrouillage temporel pour la gouvernance
contract TimeLock is TimelockController {
    /// @notice Construit un nouveau contrôleur de verrouillage temporel
    /// @dev Initialise le contrôleur avec les paramètres spécifiés
    /// @param _minDelay Le délai minimal avant qu'une proposition puisse être exécutée
    /// @param _proposers La liste des adresses autorisées à créer des propositions
    /// @param _executors La liste des adresses autorisées à exécuter des propositions
    /// @param _admin L'adresse autorisée à modifier les proposants, les exécuteurs et le délai minimal
    constructor(
        uint256 _minDelay,
        address[] memory _proposers,
        address[] memory _executors,
        address _admin
    ) TimelockController(_minDelay, _proposers, _executors, msg.sender) {}
}