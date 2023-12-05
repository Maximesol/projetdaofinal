const { network } = require("hardhat")
const {VOTING_DELAY} = require('../helper-hardhat-config')

const moveBlocks = async (amount) => {
  console.log("Moving blocks...")
  for (let index = 0; index < amount; index++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    })
  }
  console.log(`Moved ${amount} blocks`)
}

moveBlocks(VOTING_DELAY + 1);
