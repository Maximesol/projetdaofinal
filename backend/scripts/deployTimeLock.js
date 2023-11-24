const hre = require("hardhat");
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

}

deployTimeLock()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });