const fs = require('fs');
const {developmentChains, VOTING_DELAY, proposalsFiles} = require('../helper-hardhat-config')
const {network, ethers} = require('hardhat')
const {moveBlocks} = require('../utils/move-block')

async function propose(args, functiontoCall, proposalDescription) {

    const {governorContractAddress, targetContractAddress } = JSON.parse(fs.readFileSync('deployedAddresses.json', 'utf8'));

    const [owner, addr1, addr2] = await hre.ethers.getSigners();


    
    // Charger les adresses déployées
  const governorContract = await ethers.getContractAt("GovernorContract", governorContractAddress)

  const targetContract = await ethers.getContractAt("TargetContract", targetContractAddress)

  const encodedFunctionCall = targetContract.interface.encodeFunctionData(functiontoCall, [args]);
  console.log(`Proposing ${functiontoCall} on ${targetContract.target} with ${args}`)
  console.log(`Proposal Description:\n  ${proposalDescription}`)

  const proposeTx = await governorContract.propose(
    [targetContract.target],
    [0],
    [encodedFunctionCall],
    proposalDescription
  )
  
  // If working on a development chain, we will push forward till we get to the voting period.
  if (developmentChains.includes(network.name)) {
      await moveBlocks(VOTING_DELAY + 1)
    }
    
    const proposeReceipt = await proposeTx.wait(1)

    const proposalId = proposeReceipt.logs[0].args[0].toString();
    console.log(`Proposal ID: ${proposalId}`);

    const proposalState = await governorContract.state(proposalId)
    const proposalSnapShot = await governorContract.proposalSnapshot(proposalId)
    const proposalDeadline = await governorContract.proposalDeadline(proposalId)

    // save the proposalId
    storeProposalId(proposalId);

    // the Proposal State is an enum data type, defined in the IGovernor contract.
    // 0:Pending, 1:Active, 2:Canceled, 3:Defeated, 4:Succeeded, 5:Queued, 6:Expired, 7:Executed
    console.log(`Current Proposal State: ${proposalState}`)
    // What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`)


}


function storeProposalId(proposalId) {
    const chainId = network.config.chainId.toString();
    let proposals;
  
    if (fs.existsSync(proposalsFiles)) {
        proposals = JSON.parse(fs.readFileSync(proposalsFiles, "utf8"));
    } else {
        proposals = { };
        proposals[chainId] = [];
    }   
    proposals[chainId].push(proposalId.toString());
    fs.writeFileSync(proposalsFiles, JSON.stringify(proposals), "utf8");
  }

propose(77, "store", "Proposal #1: Store 77 in TargetContract")
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }
    );
