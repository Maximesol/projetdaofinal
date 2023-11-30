const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { MIN_DELAY, VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE, ADDRESS_ZERO } = require("../helper-hardhat-config");

describe("TargetContract", function () {
  /// :::: FIXTURES :::: //
  async function deployTargetContract() {
    const [owner, addr1] = await ethers.getSigners();

    const TokenGouv = await ethers.getContractFactory("TokenGouv");
    const tokenGouv = await TokenGouv.deploy(owner.address);

    const TimeLock = await ethers.getContractFactory("TimeLock");
    const timeLock = await TimeLock.deploy(
        MIN_DELAY,
        [],
        [],
        owner.address
      );

    const GovernorContract = await ethers.getContractFactory("GovernorContract");
    const governorContract = await GovernorContract.deploy(
        tokenGouv.target,
        timeLock.target,
        VOTING_DELAY,
        VOTING_PERIOD,
        QUORUM_PERCENTAGE,
      );;
      await governorContract.waitForDeployment();

    const TargetContract = await ethers.getContractFactory("TargetContract");
    const targetContract = await TargetContract.deploy();


    return { tokenGouv, timeLock, governorContract,targetContract, owner, addr1};
  }

  // Test de la fonction store
  describe("store", function () {
    it("Should store a new value and emit an event", async function () {
      const { targetContract } = await loadFixture(deployTargetContract);

      await expect(targetContract.store(42))
        .to.emit(targetContract, "ValueChanged")
        .withArgs(42);
    });

    it("Should revert if a non-owner tries to store a value", async function () {
      const { targetContract, addr1 } = await loadFixture(deployTargetContract);

      await expect(targetContract.connect(addr1).store(42)).to.be.revertedWithCustomError(
        targetContract,
        "OwnableUnauthorizedAccount"
      )
    });
  });

  // Test de la fonction retrieve
  describe("retrieve", function () {
    it("Should return the value previously stored", async function () {
      const { targetContract } = await loadFixture(deployTargetContract);

      await targetContract.store(42);
      expect(await targetContract.retrieve()).to.equal(42);
    });
  });

  // Test de la réception d'Ether
  describe("receive", function () {
    it("should take all the sent ethers", async function () {
      const { owner, targetContract } = await loadFixture(deployTargetContract);
  
      // Vérifier le solde du contrat avant la transaction
      const initialContractBalance = await ethers.provider.getBalance(targetContract.target);
  
      // Envoyer des ethers au contrat
      const tx = {
        to: targetContract.target,
        value: ethers.parseEther("1")
      };
      await owner.sendTransaction(tx);
  
      // Vérifier que le solde du contrat a augmenté de la quantité envoyée
      const finalContractBalance = await ethers.provider.getBalance(targetContract.target);
      expect(initialContractBalance).to.equal("0");
      expect(finalContractBalance).to.equal(ethers.parseEther("1"));
    });
  });

  // Test de la fonction fallback
  describe("fallback", function () {
    it("should take all the sent ethers", async function () {
      const { owner, targetContract } = await loadFixture(deployTargetContract);
  
      // Vérifier le solde du contrat avant la transaction
      const initialContractBalance = await ethers.provider.getBalance(targetContract.target);
  
      // Envoyer des ethers au contrat
      const tx = {
        to: targetContract.target,
        value: ethers.parseEther("1"),
        data: "0x1234"
      };
      await owner.sendTransaction(tx);
  
      // Vérifier que le solde du contrat a augmenté de la quantité envoyée
      const finalContractBalance = await ethers.provider.getBalance(targetContract.target);
      expect(initialContractBalance).to.equal("0");
      expect(finalContractBalance).to.equal(ethers.parseEther("1"));
    });
  });

});
