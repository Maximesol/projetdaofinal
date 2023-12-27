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
/// @notice Governance contract for voting on governance proposals and execution of accepted proposals

contract GovernorContract is Governor, GovernorSettings, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl {

    /// @notice Count the number of suggestions made
    uint256 public s_proposalCount;

    /// @notice Built a new governance contract
    /// @dev Initializes governance settings with the provided values
    /// @param _token The token used for votes
    /// @param _timelock The timelock controller for governance
    /// @param _votingDelay The time before the start of the vote
    /// @param _votingPeriod The length of time voting is open
    /// @param _quorumPercentage The percentage of quorum required for votes
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

///@notice Governance proposal function
///@dev Checks if the nominator is authorized to make a proposal
///@param targets The addresses of the contracts to call
///@param values Values ​​to send to contracts
///@param calldatas Call data to send to contracts
///@param description Description of the proposal
function propose(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    string memory description
) public override returns (uint256) {
    address proposer = _msgSender();

    // Check description restriction
    if (!_isValidDescriptionForProposer(proposer, description)) {
        revert GovernorRestrictedProposer(proposer);
    }

    // Check the proposal threshold
    uint256 proposerVotes = getVotes(proposer, clock() - 1);
    uint256 votesThreshold = proposalThreshold();
    if (proposerVotes < votesThreshold) {
        revert GovernorInsufficientProposerVotes(proposer, proposerVotes, votesThreshold);
    }


    // Increment the proposal counter
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
