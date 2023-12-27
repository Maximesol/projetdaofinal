// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/TimelockController.sol";


//// @title TimeLock
/// @author Maxime GOGNIES
/// @notice This contract implements a time lock controller for governance
contract TimeLock is TimelockController {
    /// @notice Built a new time lock controller
    /// @dev Initializes the controller with the specified parameters
    /// @param _minDelay The minimum time before a proposal can be executed
    /// @param _proposers The list of addresses authorized to create proposals
    /// @param _executors The list of addresses authorized to execute proposals
    /// @param _admin The address authorized to modify the proponents, executors and the minimum period
    constructor(
        uint256 _minDelay,
        address[] memory _proposers,
        address[] memory _executors,
        address _admin
    ) TimelockController(_minDelay, _proposers, _executors, msg.sender) {}
}