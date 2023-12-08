// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

//// @title GovernorContract
/// @author Maxime GOGNIES  
/// @notice Contrat de gouvernance pour le vote des propositions de gouvernance et l'exécution des propositions acceptées

contract GovernorContract is Governor, GovernorSettings, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl {

    /// @notice Compte le nombre de propositions faites
    uint256 public s_proposalCount;

    /// @notice Construit un nouveau contrat de gouvernance
    /// @dev Initialise les paramètres de gouvernance avec les valeurs fournies
    /// @param _token Le token utilisé pour les votes
    /// @param _timelock Le contrôleur de verrouillage temporel pour la gouvernance
    /// @param _votingDelay Le délai avant le début du vote
    /// @param _votingPeriod La durée pendant laquelle le vote est ouvert
    /// @param _quorumPercentage Le pourcentage de quorum nécessaire pour les votes
    constructor(IVotes _token, TimelockController _timelock, uint48 _votingDelay, uint32 _votingPeriod, uint256 _quorumPercentage)
        Governor("GovernorContract")
        GovernorSettings(
            _votingDelay,
            _votingPeriod,
            1)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumPercentage)
        GovernorTimelockControl(_timelock)
    {
        s_proposalCount = 0;
    }

    // The following functions are overrides required by Solidity.

///@notice Fonction de proposition de gouvernance
///@dev Vérifie si le proposant est autorisé à faire une proposition
///@param targets Les adresses des contrats à appeler
///@param values Les valeurs à envoyer aux contrats
///@param calldatas Les données d'appel à envoyer aux contrats
///@param description La description de la proposition
function propose(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    string memory description
) public override returns (uint256) {
    address proposer = _msgSender();

    // Vérifier la restriction de description
    if (!_isValidDescriptionForProposer(proposer, description)) {
        revert GovernorRestrictedProposer(proposer);
    }

    // Vérifier le seuil de proposition
    uint256 proposerVotes = getVotes(proposer, clock() - 1);
    uint256 votesThreshold = proposalThreshold();
    if (proposerVotes < votesThreshold) {
        revert GovernorInsufficientProposerVotes(proposer, proposerVotes, votesThreshold);
    }


    // Incrémenter le compteur de propositions
    s_proposalCount += 1;

    return _propose(targets, values, calldatas, description, proposer);
}

    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function _queueOperations(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint48)
    {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
    {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint256)
    {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function getNumberOfProposals() public view returns (uint256) {
        return s_proposalCount;
    }
}
