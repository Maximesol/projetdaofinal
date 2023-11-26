const fs = require('fs');
const { developmentChains, VOTING_PERIOD, proposalsFiles } = require('../helper-hardhat-config');
const { network, ethers } = require('hardhat');
const { moveBlocks } = require('../utils/move-block');

async function main() {
    const proposals = JSON.parse(fs.readFileSync(proposalsFiles, "utf8"));
    const proposalId = proposals[network.config.chainId].at(-1);
    const voteWay = 1; // For
    const reason = "I lika do da cha cha";

    const { governorContractAddress } = JSON.parse(fs.readFileSync('deployedAddresses.json', 'utf8'));
    const governor = await ethers.getContractAt("GovernorContract", governorContractAddress);

    console.log(`Voting on proposal ID: ${proposalId}`);
    const proposalBeforeVote = await governor.state(proposalId);
    console.log(`Proposal state before voting: ${proposalBeforeVote}`);
    const currentBlock = await ethers.provider.getBlockNumber();
    const quorumNeeded = await governor.quorum(currentBlock - 1);
    console.log(`Quorum needed: ${quorumNeeded}`);

    await vote(proposalId, voteWay, reason, governor);

    const proposalAfterVote = await governor.state(proposalId);
    console.log(`Proposal state after voting: ${proposalAfterVote}`);

    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1);
    }

    const proposalFinalState = await governor.state(proposalId);
    console.log(`Final proposal state: ${proposalFinalState}`);
}

async function vote(proposalId, voteWay, reason, governor) {
    console.log("Voting...");
    const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason);
    const voteTxReceipt = await voteTx.wait(1);
    console.log(`Voted with reason: ${reason}`);
    console.log(voteTxReceipt.logs[0].args[4]); // Afficher la raison du vote
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

module.exports = {
    vote,
};
