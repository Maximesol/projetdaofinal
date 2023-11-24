const QUORUM_PERCENTAGE = 7; // Need 7% of voters to pass
const MIN_DELAY = 3600; // 1 hour - after a vote passes, you have 1 hour before you can enact
const VOTING_PERIOD = 3; // blocks
const VOTING_DELAY = 0; // 1 Block - How many blocks till a proposal vote becomes active
const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

const NEW_STORE_VALUE = 77;
const FUNC = "store";
const PROPOSAL_DESCRIPTION = "Proposal #1 77 in the Box!";

module.exports = {
  QUORUM_PERCENTAGE,
  MIN_DELAY,
  VOTING_PERIOD,
  VOTING_DELAY,
  ADDRESS_ZERO,
  NEW_STORE_VALUE,
  FUNC,
  PROPOSAL_DESCRIPTION,
};
