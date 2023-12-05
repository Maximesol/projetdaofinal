const fs = require('fs');
const {developmentChains, VOTING_DELAY, proposalsFiles, PROPOSAL_DESCRIPTION, PROPOSAL_DESCRIPTION_2} = require('../helper-hardhat-config')
const {network, ethers} = require('hardhat')
const {moveBlocks} = require('../utils/move-block')

async function propose(functionToCall, args, proposalDescription) {

    const {governorContractAddress, targetContractAddress, tokenGouvAddress } = JSON.parse(fs.readFileSync('deployedAddresses.json', 'utf8'));

    const [owner, addr1, addr2] = await hre.ethers.getSigners();


    
    // Charger les adresses déployées
  const governorContract = await ethers.getContractAt("GovernorContract", governorContractAddress)
  const tokenGouvContract = await ethers.getContractAt("TokenGouv", tokenGouvAddress)
  const targetContract = await ethers.getContractAt("TargetContract", targetContractAddress)

  const targetAddress = args[0]; // L'adresse de TargetContract
  const amountInWei = ethers.parseEther(args[1].toString()); // 
  
  const encodedFunctionCall = tokenGouvContract.interface.encodeFunctionData(functionToCall, [targetAddress, amountInWei]);
  console.log(`Encoded Function Call: ${encodedFunctionCall}`)

  console.log(`Proposing to transfer ${amountToTransfer.toString()} ETH to ${targetContractAddress} with ${args}`);
  console.log(`Proposal Description:\n  ${PROPOSAL_DESCRIPTION_2}`);
  
  const currentBlockBefore = await ethers.provider.getBlockNumber()
  console.log(`Current Block Number before the propose function moving block: ${currentBlockBefore}`)

  const proposeTx = await governorContract.propose(
      [tokenGouvAddress],
      [0],
      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION_2
      );
    const proposeReceipt = await proposeTx.wait(1)
    const proposalId = proposeReceipt.logs[0].args[0].toString();
    console.log(`Proposal ID: ${proposalId}`);

  if (developmentChains.includes(network.name)) {
      await moveBlocks(VOTING_DELAY + 1)
    }
    


    const proposalState = await governorContract.state(proposalId)
    const proposalSnapShot = await governorContract.proposalSnapshot(proposalId)

    const proposalDeadline = await governorContract.proposalDeadline(proposalId)
    // recupérer le quorum
    const quorumRequired = await governorContract.quorum(proposalSnapShot)

    // save the proposalId
    storeProposalId(proposalId);

    // the Proposal State is an enum data type, defined in the IGovernor contract.
    // 0:Pending, 1:Active, 2:Canceled, 3:Defeated, 4:Succeeded, 5:Queued, 6:Expired, 7:Executed
    console.log(`Current Proposal State: ${proposalState}`)


    //check current block number
    const currentBlock = await ethers.provider.getBlockNumber()
    console.log(`Current Block Number after moving block: ${currentBlock}`)


    // What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`)
    // The quorum required for the proposal to pass
    console.log(`Current Proposal Quorum: ${quorumRequired}`)

    // check le nombre de proposition
    const proposalCount = await governorContract.getNumberOfProposals()
    console.log(`Current Proposal Count: ${proposalCount}`)


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
  const targetContractAddress = "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d"; // Adresse de TargetContract
  const amountToTransfer = "10"; // Montant en ETH

propose("transferEth", [targetContractAddress, amountToTransfer], PROPOSAL_DESCRIPTION_2)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }
    );
