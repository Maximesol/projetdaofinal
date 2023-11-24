const hre = require("hardhat");
const fs = require('fs');
const { MIN_DELAY } = require("../helper-hardhat-config");

async function deployTimeLock() {
  const [deployer] = await hre.ethers.getSigners();
    console.log(
    "Deploying contracts with the account:",
    deployer.address
    );

    // Deploy TimeLock
  const TimeLock = await hre.ethers.getContractFactory("TimeLock");
  const timeLock = await TimeLock.deploy(
    MIN_DELAY,
    [],
    [],
    deployer.address
  );
  await timeLock.waitForDeployment();

  console.log(`TimeLock deployed to ${timeLock.target}`);
  console.log(`TimeLock deployed from ${deployer.address}`);

  const timeLockAddress = timeLock.target;
  console.log(`TimeLock deployed to ${timeLockAddress}`);

// Charger les adresses existantes, ajouter TimeLock et réécrire le fichier
  const deployedAddresses = JSON.parse(fs.readFileSync('deployedAddresses.json', 'utf8'));
  deployedAddresses.timeLockAddress = timeLockAddress;
  fs.writeFileSync('deployedAddresses.json', JSON.stringify(deployedAddresses, null, 2));

}

deployTimeLock()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });