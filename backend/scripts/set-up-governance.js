const hre = require("hardhat");
const fs = require('fs');
const {ADDRESS_ZERO} = require("../helper-hardhat-config");

async function setUpGovernance() {
const [owner, addr1, addr2] = await hre.ethers.getSigners();
console.log("Setting up  contracts with the account:",owner.address);

  // Charger les adresses déployées
const { tokenGouvAddress, timeLockAddress, governorContractAddress } = JSON.parse(fs.readFileSync('deployedAddresses.json', 'utf8'));
console.log(`TokenGouv Address: ${tokenGouvAddress}`);
console.log(`TimeLock Address: ${timeLockAddress}`);
console.log(`GovernorContract Address: ${governorContractAddress}`);

 // Récupérer les instances des contrats
const timeLock = await hre.ethers.getContractAt("TimeLock", timeLockAddress, owner);
const governorContract = await hre.ethers.getContractAt("GovernorContract", governorContractAddress, owner);


console.log("Setting up roles....")

const proposerRole = await timeLock.PROPOSER_ROLE();
const executorRole = await timeLock.EXECUTOR_ROLE();

const proposerTx = await timeLock.grantRole(proposerRole, governorContract.target);
await proposerTx.wait();
console.log(`Proposer role granted to GovernorContract`);
console.log(`Proposer role status: ${await timeLock.hasRole(proposerRole, governorContract.target)}`);

const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
await executorTx.wait();
console.log(`Executor role granted to ADDRESS_ZERO`);
console.log(`Executor role status: ${await timeLock.hasRole(executorRole, ADDRESS_ZERO)}`);

// revoke deployer's role
const adminRole = await timeLock.DEFAULT_ADMIN_ROLE();
const revokeAdminTx = await timeLock.revokeRole(adminRole, owner); // ou l'adresse que tu veux révoquer
await revokeAdminTx.wait();
console.log(`Admin role revoked from deployer`);
console.log(`Admin role status for deployer: ${await timeLock.hasRole(adminRole, owner)}`);

console.log("Governance setup complete.");


}

setUpGovernance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
