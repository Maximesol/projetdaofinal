const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("TokenGouv Contract", function () {

  // Fixture pour déployer le contrat
  async function deployTokenGouv() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const TokenGouv = await ethers.getContractFactory("TokenGouv");
    const tokenGouv = await TokenGouv.deploy(owner.address);
    return { tokenGouv, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { tokenGouv, owner } = await loadFixture(deployTokenGouv);
      expect(await tokenGouv.owner()).to.equal(owner.address);
    });
  });

  describe("Whitelist Management", function () {

    // addtoWhitelist
    it("Should allow owner to add an address to whitelist", async function () {
      const { tokenGouv, addr1 } = await loadFixture(deployTokenGouv);
      await tokenGouv.addToWhitelist(addr1.address);
      expect(await tokenGouv.isWhitelisted(addr1.address)).to.be.true;
    });

    it("Should revert for non-owner trying to add an address to whitelist", async function () {
      const { tokenGouv, addr1 } = await loadFixture(deployTokenGouv);
      await expect(tokenGouv.connect(addr1).addToWhitelist(addr1.address))
        .to.be.revertedWithCustomError(tokenGouv, "OwnableUnauthorizedAccount");

    it("Should revert if address is already whitelisted", async function () {
      const { tokenGouv, addr1 } = await loadFixture(deployTokenGouv);
      await tokenGouv.addToWhitelist(addr1.address);
      await expect(tokenGouv.addToWhitelist(addr1.address))
        .to.be.revertedWith("Investor already whitelisted");
    });

    it("should add the address to the whitelist", async function () {
      const { tokenGouv, addr1 } = await loadFixture(deployTokenGouv);
      await tokenGouv.addToWhitelist(addr1.address);
      expect(await tokenGouv.isWhitelisted(addr1.address)).to.be.true;
    });

    it("should emit a Whitelisted event", async function () {
      const { tokenGouv, addr1 } = await loadFixture(deployTokenGouv);
      await expect(tokenGouv.addToWhitelist(addr1.address))
        .to.emit(tokenGouv, "Whitelisted")
        .withArgs(addr1.address);
    });


    // removeFromWhitelist

    it("Should allow owner to remove an address from whitelist", async function () {
      const { tokenGouv, addr1 } = await loadFixture(deployTokenGouv);
      await tokenGouv.addToWhitelist(addr1.address);
      await tokenGouv.removeFromWhitelist(addr1.address);
      expect(await tokenGouv.isWhitelisted(addr1.address)).to.be.false;
    });

    it("Should revert for non-owner trying to remove an address from whitelist", async function () {
      const { tokenGouv, addr1 } = await loadFixture(deployTokenGouv);
      await tokenGouv.addToWhitelist(addr1.address);
      await expect(tokenGouv.connect(addr1).removeFromWhitelist(addr1.address))
        .to.be.revertedWithCustomError(tokenGouv, "OwnableUnauthorizedAccount");
    });

  })});

  describe("Token Purchase", function () {
    // buyTokens
    it("Should revert for non-whitelisted buyer", async function () {
      const { tokenGouv, addr1 } = await loadFixture(deployTokenGouv);
      await expect(tokenGouv.connect(addr1).buyTokens({ value: ethers.parseEther("1") }))
        .to.be.revertedWith("Address not whitelisted");
    });

    it("Should revert if the value sent is not enough", async function () {
      const { tokenGouv, addr1 } = await loadFixture(deployTokenGouv);
      await tokenGouv.addToWhitelist(addr1.address);
      await expect(tokenGouv.connect(addr1).buyTokens({ value: ethers.parseEther("0") }))
        .to.be.revertedWith("Invalid ETH amount");
    });

    it("Should revert if the maxSupply is reached", async function () {
      const { tokenGouv, owner, addr1 } = await loadFixture(deployTokenGouv);
      await tokenGouv.addToWhitelist(addr1.address);
    
      // Définir une valeur proche de la maxSupply pour le mint
      const almostMaxSupply = "999999" + "0".repeat(18); // 999999 tokens en unités entières
      await tokenGouv.mint(owner.address, almostMaxSupply);
    
      // Essayer d'acheter suffisamment de tokens pour dépasser maxSupply
      const purchaseAmount = ethers.parseEther("2"); // 2 ETH
      await expect(tokenGouv.connect(addr1).buyTokens({ value: purchaseAmount }))
        .to.be.revertedWith("Exceeds max supply");
    });

    it("Should allow whitelisted address to buy tokens", async function () {
      const { tokenGouv, addr1 } = await loadFixture(deployTokenGouv);
      await tokenGouv.addToWhitelist(addr1.address);
      await tokenGouv.connect(addr1).buyTokens({ value: ethers.parseEther("1") });
      expect(await tokenGouv.balanceOf(addr1.address)).to.be.above(0);
    });

  });

  describe("Mint", function () {

    it("Should revert for non-owner trying to mint", async function () {
      const { tokenGouv, addr1 } = await loadFixture(deployTokenGouv);
      await expect(tokenGouv.connect(addr1).mint(addr1.address, 1))
        .to.be.revertedWithCustomError(tokenGouv, "OwnableUnauthorizedAccount");
    });

    it("Should revert if the maxSupply is reached when minting", async function () {
      const { tokenGouv, owner } = await loadFixture(deployTokenGouv);
    
      // Définir une valeur proche de la maxSupply pour le mint
      const almostMaxSupply = ethers.parseUnits("999999", 18); // 999999 tokens en unités entières
      await tokenGouv.mint(owner.address, almostMaxSupply);
    
      // Essayer de mint une petite quantité supplémentaire pour dépasser maxSupply
      const smallAmount = ethers.parseUnits("2", 18); // 2 tokens supplémentaires
      await expect(tokenGouv.mint(owner.address, smallAmount))
        .to.be.revertedWith("Exceeds max supply");
    });

    it("Should mint the correct amount of tokens", async function () {
      const { tokenGouv, owner } = await loadFixture(deployTokenGouv);
      await tokenGouv.mint(owner.address, 1);
      expect(await tokenGouv.totalSupply()).to.equal(1);
    });
  })
  describe("receive", function () {
    it("should take all the sent ethers", async function () {
      const { tokenGouv, owner } = await loadFixture(deployTokenGouv);
  
      // Vérifier le solde du contrat avant la transaction
      const initialContractBalance = await ethers.provider.getBalance(tokenGouv.target);
  
      // Envoyer des ethers au contrat
      const tx = {
        to: tokenGouv.target,
        value: ethers.parseEther("1")
      };
      await owner.sendTransaction(tx);
  
      // Vérifier que le solde du contrat a augmenté de la quantité envoyée
      const finalContractBalance = await ethers.provider.getBalance(tokenGouv.target);
      expect(initialContractBalance).to.equal("0");
      expect(finalContractBalance).to.equal(ethers.parseEther("1"));
    });
  });
  
  describe("setIcoRate", function () {
    it("Should revert for non-owner trying to setIcoRate", async function () {
      const { tokenGouv, addr1 } = await loadFixture(deployTokenGouv);
      await expect(tokenGouv.connect(addr1).setIcoRate(1))
        .to.be.revertedWithCustomError(tokenGouv, "OwnableUnauthorizedAccount");
    });

    it("Should set the icoRate", async function () {
      const { tokenGouv, owner } = await loadFixture(deployTokenGouv);
      expect(await tokenGouv.rateIco()).to.equal(5000);
      await tokenGouv.setIcoRate(1000);
      expect(await tokenGouv.rateIco()).to.equal(1000);
    });
  });
  
});

