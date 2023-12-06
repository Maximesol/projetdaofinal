const fs = require('fs');
const { developmentChains, PROPOSAL_DESCRIPTION_2, MIN_DELAY, proposalsFiles} = require('../helper-hardhat-config');
const { network, ethers } = require('hardhat');
const {moveTime} = require('../utils/move-time')
const {moveBlocks} = require('../utils/move-block')

const queueAndExecute =  async() => {
  const functionToCall = "transferEth";
  const { targetContractAddress, governorContractAddress, tokenGouvAddress } = JSON.parse(fs.readFileSync('deployedAddresses.json', 'utf8'));

  const target = await ethers.getContractAt("TargetContract", targetContractAddress)
  const tokenGouvContract = await ethers.getContractAt("TokenGouv", tokenGouvAddress)

  const targetAddress = target.target
  console.log(`Target address: ${targetAddress}`)
  console.log(`TokenGouv address: ${tokenGouvContract.target}`)

  const amountInWei = ethers.parseEther("10");

  const encodedFunctionCall = tokenGouvContract.interface.encodeFunctionData(functionToCall, [targetAddress, amountInWei]);


  const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(PROPOSAL_DESCRIPTION_2))
  console.log(`Description hash: ${descriptionHash}`)

  // could also use ethers.utils.id(PROPOSAL_DESCRIPTION)

  const governor = await ethers.getContractAt("GovernorContract", governorContractAddress);

  const contractEthBalanceBefore = await hre.ethers.provider.getBalance(targetContractAddress);
  console.log(`Balance en ETH du contrat Target avant execution: ${hre.ethers.formatEther(contractEthBalanceBefore)} ETH`);


  const tokenGouvEthBalanceBefore = await hre.ethers.provider.getBalance(tokenGouvAddress);
    console.log(`Balance en ETH du contrat TokenGouv avant éxécution de la proposal: ${hre.ethers.formatEther(tokenGouvEthBalanceBefore)} ETH`);

  // recuperer l'ID de la proposition

  const proposals = JSON.parse(fs.readFileSync(proposalsFiles, "utf8"));
  const chainId = network.config.chainId.toString();
  const proposalId = proposals[chainId].at(-1); // Prend le dernier ID de proposition pour la chaîne actuelle
  
  console.log(`Dernier ID de proposition: ${proposalId}`);
  const proposalState = await governor.state(proposalId);
  console.log(`État de la proposition : ${proposalState}`);


  console.log("Queueing...")
  console.log(tokenGouvContract.target)
  const queueTx = await governor.queue([tokenGouvContract.target], [0], [encodedFunctionCall], descriptionHash)
  const queueTxReceipt = await queueTx.wait(1)


  console.log(`transaction queued by: ${queueTxReceipt.from}`)


  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1)
    await moveBlocks(1)
  }

  console.log("Executing...")
  // this will fail on a testnet because you need to wait for the MIN_DELAY!
  const executeTx = await governor.execute(
    [tokenGouvContract.target],
    [0],
    [encodedFunctionCall],
    descriptionHash
  )
  await executeTx.wait(1)

    const contractEthBalance = await hre.ethers.provider.getBalance(targetContractAddress);
    console.log(`Balance en ETH du contrat Target après execution: ${hre.ethers.formatEther(contractEthBalance)} ETH`);

    const tokenGouvEthBalance = await hre.ethers.provider.getBalance(tokenGouvAddress);
    console.log(`Balance en ETH du contrat TokenGouv après éxécution de la proposal: ${hre.ethers.formatEther(tokenGouvEthBalance)} ETH`);
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })