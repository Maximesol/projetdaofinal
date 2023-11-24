const hre = require("hardhat");
const fs = require('fs');
const {QUORUM_PERCENTAGE, MIN_DELAY, VOTING_PERIOD, VOTING_DELAY, ADDRESS_ZERO} = require("../helper-hardhat-config");

async function deployGovernorContract() {
  const [owner, addr1, addr2] = await hre.ethers.getSigners();
    console.log(
    "Deploying contracts with the account:",
    owner.address
    );

  // Charger les adresses déployées
  const { tokenGouvAddress, timeLockAddress } = JSON.parse(fs.readFileSync('deployedAddresses.json', 'utf8'));
  console.log(`TokenGouv Address: ${tokenGouvAddress}`);
  console.log(`TimeLock Address: ${timeLockAddress}`);

    // Deploy GovernorContract
  const GovernorContract = await hre.ethers.getContractFactory("GovernorContract");
  const governorContract = await GovernorContract.deploy(
    tokenGouvAddress,
    timeLockAddress,
    VOTING_DELAY,
    VOTING_PERIOD,
    QUORUM_PERCENTAGE,
  );
  await governorContract.waitForDeployment();

  console.log(`GovernorContract deployed to ${governorContract.target}`);

  const deployedAddresses = { 
    tokenGouvAddress, 
    timeLockAddress, 
    governorContractAddress: governorContract.target 
  };
  fs.writeFileSync('deployedAddresses.json', JSON.stringify(deployedAddresses, null, 2));



}

deployGovernorContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
