const fs = require('fs');
const { developmentChains, PROPOSAL_DESCRIPTION, MIN_DELAY} = require('../helper-hardhat-config');
const { network, ethers } = require('hardhat');
const {moveTime} = require('../utils/move-time')
const {moveBlocks} = require('../utils/move-block')

const queueAndExecute =  async() => {
  const args = [77]
  const functionToCall = "store"
  const { targetContractAddress, governorContractAddress } = JSON.parse(fs.readFileSync('deployedAddresses.json', 'utf8'));

  const target = await ethers.getContractAt("TargetContract", targetContractAddress)

  const encodedFunctionCall = target.interface.encodeFunctionData(functionToCall, args)

  const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(PROPOSAL_DESCRIPTION))

  // could also use ethers.utils.id(PROPOSAL_DESCRIPTION)

  const governor = await ethers.getContractAt("GovernorContract", governorContractAddress);
  console.log("Queueing...")
  const queueTx = await governor.queue([target.target], [0], [encodedFunctionCall], descriptionHash)
  const queueTxReceipt = await queueTx.wait(1)
  console.log(`transaction queued by: ${queueTxReceipt.from}`)

  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1)
    await moveBlocks(1)
  }

  console.log("Executing...")
  // this will fail on a testnet because you need to wait for the MIN_DELAY!
  const executeTx = await governor.execute(
    [target.target],
    [0],
    [encodedFunctionCall],
    descriptionHash
  )
  await executeTx.wait(1)

  console.log(`Current stored value: ${await target.retrieve()}`);
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })