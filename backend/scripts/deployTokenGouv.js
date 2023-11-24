const hre = require("hardhat");

async function deployGovernorContract() {
  const [owner, addr1, addr2] = await hre.ethers.getSigners();
    console.log(
    "Deploying contracts with the account:",
    owner.address
    );

    // Deploy TokenGouv
  const TokenGouv = await hre.ethers.getContractFactory("TokenGouv");
  const tokenGouv = await TokenGouv.deploy(owner.address);
  await tokenGouv.waitForDeployment();

  console.log(`Voting deployed to ${tokenGouv.target}`);

  // Appeler les fonctions pour obtenir le nom et le symbole
  const name = await tokenGouv.name();
  const symbol = await tokenGouv.symbol();

  console.log("Nom du Token:", name);
  console.log("Symbole du Token:", symbol);

  const mintAmount = hre.ethers.parseEther("1000");
  const mintAmount2 = mintAmount.toString() / 1e18;
  await tokenGouv.mint(owner.address, mintAmount);
  console.log(`Minted ${mintAmount2} ${symbol} tokens à owner`);

  // check le balance de owner
  const ownerBalance = await tokenGouv.balanceOf(owner.address);
  console.log(`Balance de owner: ${ownerBalance.toString()}`);
  
  // check le delegate du owner
  const ownerDelegate = await tokenGouv.getVotes(owner.address);
  console.log(`Delegated votes de owner: ${ownerDelegate.toString()}`);

  // delegate les votes
  await tokenGouv.delegate(owner.address);
  console.log(`Delegated votes à addr1`);

  // check les delegated votes
  const delegatedVotes = await tokenGouv.getVotes(owner.address);
  
  console.log(`Delegated votes de owner: ${delegatedVotes.toString()}`);

  const numOwnerCheckpoints = await tokenGouv.numCheckpoints(owner.address);
  console.log(`Nombre de checkpoints pour owner: ${numOwnerCheckpoints}`);


}

deployGovernorContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
