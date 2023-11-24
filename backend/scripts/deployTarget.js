const hre = require("hardhat");
const fs = require('fs');

async function deployTarget() {
  const [owner, addr1, addr2] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", owner.address);

  // Charger les adresses déployées
  const {timeLockAddress } = JSON.parse(fs.readFileSync('deployedAddresses.json', 'utf8'));
  console.log(`TimeLock Address: ${timeLockAddress}`);

    // Deploy GovernorContract
  const TargetContract = await hre.ethers.getContractFactory("TargetContract");
  const targetContract = await TargetContract.deploy(owner)
  await targetContract.waitForDeployment();

  console.log(`target deployed to ${targetContract.target}`);

  const target = await ethers.getContractAt("TargetContract", targetContract.target)
  const transferTx = await target.transferOwnership(timeLockAddress)
  await transferTx.wait(1)

  // Vérifier le nouveau propriétaire
  const newOwner = await targetContract.owner();
  console.log(`New owner of TargetContract: ${newOwner}`);

  // Vérification
  if (newOwner === timeLockAddress) {
    console.log("Ownership successfully transferred to TimeLock.");
  } else {
    console.log("Ownership transfer failed.");
  }
  
}

deployTarget()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
