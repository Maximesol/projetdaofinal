const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { MIN_DELAY, VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE, ADDRESS_ZERO } = require("../helper-hardhat-config");
const {moveBlocks} = require ('../utils/move-block');
const { moveTime } = require("../utils/move-time");


describe("GovernorContract", function () {

  // :::: FIXTURES :::: //
  async function deployGovernorContract() {
    const [owner, addr1, addr2] = await ethers.getSigners();

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


    return { tokenGouv, timeLock, governorContract, owner, addr1};
  }

  async function deployGovernorContractWithIco() {
    const signers = await ethers.getSigners();

    const TokenGouv = await ethers.getContractFactory("TokenGouv");
    const tokenGouv = await TokenGouv.deploy(signers[0].address);

    for (let i = 1; i <= 10; i++) {
        const addToWhitelistTx = await tokenGouv.connect(signers[0]).addToWhitelist(signers[i].address);
        await addToWhitelistTx.wait();
    }

    // Liste des adresses et des montants en ETH pour l'ICO
    const participants = [
        {  signer: signers[1],ethAmount: "10" }, 
        {  signer: signers[2],ethAmount: "2" },
        {  signer: signers[3],ethAmount: "3" },
        {  signer: signers[4],ethAmount: "2" },
        {  signer: signers[5],ethAmount: "1" },
        {  signer: signers[6],ethAmount: "2" },
        {  signer: signers[7],ethAmount: "1" },
        {  signer: signers[8],ethAmount: "1" },
        {  signer: signers[9],ethAmount: "1" },
        {  signer: signers[10],ethAmount: "1" },
    ];

    for (const participant of participants) {
        const ethAmount = hre.ethers.parseEther(participant.ethAmount);

        await tokenGouv.connect(participant.signer).buyTokens({ value: ethAmount });

    }
    await tokenGouv.connect(signers[1]).delegate(signers[1].address);

    
    await hre.ethers.provider.getBalance(tokenGouv.target);

    const TimeLock = await ethers.getContractFactory("TimeLock");
    const timeLock = await TimeLock.deploy(
        MIN_DELAY,
        [],
        [],
        signers[0].address
      );

    const GovernorContract = await ethers.getContractFactory("GovernorContract");
    const governorContract = await GovernorContract.deploy(
        tokenGouv.target,
        timeLock.target,
        VOTING_DELAY,
        VOTING_PERIOD,
        QUORUM_PERCENTAGE,
      );
      await governorContract.waitForDeployment();

    const TargetContract = await ethers.getContractFactory("TargetContract");
    const targetContract = await TargetContract.deploy();



    return { tokenGouv, signers, timeLock, governorContract, targetContract };


  }

  async function deployGovernorContractWithProposalCreated () {
    const signers = await ethers.getSigners();

    const TokenGouv = await ethers.getContractFactory("TokenGouv");
    const tokenGouv = await TokenGouv.deploy(signers[0].address);

    // :::::::: ICO :::::::: //
    for (let i = 1; i <= 10; i++) {
        const addToWhitelistTx = await tokenGouv.connect(signers[0]).addToWhitelist(signers[i].address);
        await addToWhitelistTx.wait();
    }

    // Liste des adresses et des montants en ETH pour l'ICO
    const participants = [
        {  signer: signers[1],ethAmount: "10" }, 
        {  signer: signers[2],ethAmount: "2" },
        {  signer: signers[3],ethAmount: "3" },
        {  signer: signers[4],ethAmount: "2" },
        {  signer: signers[5],ethAmount: "1" },
        {  signer: signers[6],ethAmount: "2" },
        {  signer: signers[7],ethAmount: "1" },
        {  signer: signers[8],ethAmount: "1" },
        {  signer: signers[9],ethAmount: "1" },
        {  signer: signers[10],ethAmount: "1" },
    ];

    for (const participant of participants) {
        const ethAmount = hre.ethers.parseEther(participant.ethAmount);

        await tokenGouv.connect(participant.signer).buyTokens({ value: ethAmount });

    }
    await tokenGouv.connect(signers[1]).delegate(signers[1].address);

    const TimeLock = await ethers.getContractFactory("TimeLock");
    const timeLock = await TimeLock.deploy(
        MIN_DELAY,
        [],
        [],
        signers[0].address
      );

    const GovernorContract = await ethers.getContractFactory("GovernorContract");
    const governorContract = await GovernorContract.deploy(
        tokenGouv.target,
        timeLock.target,
        1,
        VOTING_PERIOD,
        QUORUM_PERCENTAGE,
      );
      await governorContract.waitForDeployment();

    await tokenGouv.setTimeLockAddress(timeLock.target) 

    // transfert ownership du tokenGouv au governorContract
    await tokenGouv.connect(signers[0]).transferOwnership(governorContract.target);

    // SETTING ROLES FOR TIMELOCK
    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executorRole = await timeLock.EXECUTOR_ROLE();

    const proposerTx = await timeLock.connect(signers[0]).grantRole(proposerRole, governorContract.target);
    await proposerTx.wait();
    const executorTx = await timeLock.connect(signers[0]).grantRole(executorRole, ADDRESS_ZERO);
    await executorTx.wait();

    // Revoke Admin role for signers[0]
    const adminRole = await timeLock.DEFAULT_ADMIN_ROLE();
    const revokeAdminTx = await timeLock.connect(signers[0]).revokeRole(adminRole, signers[0].address);
    await revokeAdminTx.wait();

    const TargetContract = await ethers.getContractFactory("TargetContract");
    const targetContract = await TargetContract.deploy();

    const encodedFunction = tokenGouv.interface.encodeFunctionData("transferEth", [targetContract.target, "10"]);
    const proposalTx = await governorContract.connect(signers[1]).propose(
        [tokenGouv.target],
        [0],
        [encodedFunction],
        "Test proposal"
      )
    const proposeReceipt = await proposalTx.wait();
    const proposalId = proposeReceipt.logs[0].args[0].toString();

    return { tokenGouv, signers, timeLock, governorContract, targetContract, proposalId };

  }

  async function deployGovernorContractWithProposeAndVoteDone() {
    const signers = await ethers.getSigners();

    const TokenGouv = await ethers.getContractFactory("TokenGouv");
    const tokenGouv = await TokenGouv.deploy(signers[0].address);

    // :::::::: ICO :::::::: //
    for (let i = 1; i <= 10; i++) {
        const addToWhitelistTx = await tokenGouv.connect(signers[0]).addToWhitelist(signers[i].address);
        await addToWhitelistTx.wait();
    }

    // Liste des adresses et des montants en ETH pour l'ICO
    const participants = [
        {  signer: signers[1],ethAmount: "10" }, 
        {  signer: signers[2],ethAmount: "2" },
        {  signer: signers[3],ethAmount: "3" },
        {  signer: signers[4],ethAmount: "2" },
        {  signer: signers[5],ethAmount: "1" },
        {  signer: signers[6],ethAmount: "2" },
        {  signer: signers[7],ethAmount: "1" },
        {  signer: signers[8],ethAmount: "1" },
        {  signer: signers[9],ethAmount: "1" },
        {  signer: signers[10],ethAmount: "1" },
    ];

    for (const participant of participants) {
        const ethAmount = hre.ethers.parseEther(participant.ethAmount);

        await tokenGouv.connect(participant.signer).buyTokens({ value: ethAmount });

    }
    await tokenGouv.connect(signers[1]).delegate(signers[1].address);

    const TimeLock = await ethers.getContractFactory("TimeLock");
    const timeLock = await TimeLock.deploy(
        MIN_DELAY,
        [],
        [],
        signers[0].address
      )

    const GovernorContract = await ethers.getContractFactory("GovernorContract");
    const governorContract = await GovernorContract.deploy(
        tokenGouv.target,
        timeLock.target,
        VOTING_DELAY,
        VOTING_PERIOD,
        QUORUM_PERCENTAGE,
      )

    await tokenGouv.setTimeLockAddress(timeLock.target) 

    // transfert ownership du tokenGouv au governorContract
    await tokenGouv.connect(signers[0]).transferOwnership(governorContract.target);

    // SETTING ROLES FOR TIMELOCK
    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executorRole = await timeLock.EXECUTOR_ROLE();

    const proposerTx = await timeLock.connect(signers[0]).grantRole(proposerRole, governorContract.target);
    await proposerTx.wait();
    const executorTx = await timeLock.connect(signers[0]).grantRole(executorRole, ADDRESS_ZERO);
    await executorTx.wait();

    // Revoke Admin role for signers[0]
    const adminRole = await timeLock.DEFAULT_ADMIN_ROLE();
    const revokeAdminTx = await timeLock.connect(signers[0]).revokeRole(adminRole, signers[0].address);
    await revokeAdminTx.wait();

    const TargetContract = await ethers.getContractFactory("TargetContract");
    const targetContract = await TargetContract.deploy();

    const encodedFunction = tokenGouv.interface.encodeFunctionData("transferEth", [targetContract.target, "10"]);
    const proposalTx = await governorContract.connect(signers[1]).propose(
        [tokenGouv.target],
        [0],
        [encodedFunction],
        "Test proposal"
      )
    const proposeReceipt = await proposalTx.wait();
    const proposalId = proposeReceipt.logs[0].args[0].toString();

    await moveBlocks(VOTING_DELAY + 1);

    const voteWay = 1; // Pour le vote
    const reason = "I vote yes for the test";

    const voteTx = await governorContract.connect(signers[1]).castVoteWithReason(proposalId, voteWay, reason);
    await voteTx.wait();

    await moveBlocks(VOTING_PERIOD + 1);



    return { governorContract, tokenGouv, targetContract, proposalId, signers };
}

  // :::: TESTS DE DEPLOIEMENT :::: //

  describe("Deployment", function () {
    it("Should deploy with initial settings", async function () {
      const { governorContract } = await loadFixture(deployGovernorContract);
      expect(await governorContract.s_proposalCount()).to.equal(0);
      
    });

    it("Should deploy with initial settings", async function () {
        const { governorContract } = await loadFixture(deployGovernorContractWithIco);
        expect(await governorContract.s_proposalCount()).to.equal(0);
        
    });
  });

    // :::: TESTS DE PROPOSITION :::: //

  describe("propose", function () {
    it("Should create a new proposal", async function () {
      const { governorContract, signers, tokenGouv, targetContract } = await loadFixture(deployGovernorContractWithIco);
      const encodedFunction = tokenGouv.interface.encodeFunctionData("transferEth", [targetContract.target, "10"]);
      const proposalTx = await governorContract.connect(signers[1]).propose(
        [tokenGouv.target],
        [0],
        [encodedFunction],
        "Test proposal"
      )
      await proposalTx.wait();
      expect(await governorContract.s_proposalCount()).to.equal(1);
  });

    it ("Should revert if the description is invalid", async function () {
        const { governorContract, signers, tokenGouv, targetContract } = await loadFixture(deployGovernorContractWithIco);
        const encodedFunction = tokenGouv.interface.encodeFunctionData("transferEth", [targetContract.target, "10"]);
        await expect(governorContract.connect(signers[1]).propose(
            [tokenGouv.target],
            [0],
            [encodedFunction],
            "Some description text #proposer=0x1234567890123456789012345678901234567890"
        )).to.be.revertedWithCustomError(governorContract, "GovernorRestrictedProposer")
    })

    it("Should revert if proposer does not have enough votes", async function() {
        const { governorContract, signers, tokenGouv, targetContract } = await loadFixture(deployGovernorContractWithIco);
        const encodedFunction = tokenGouv.interface.encodeFunctionData("transferEth", [targetContract.target, "10"]);
        await expect (governorContract.connect(signers[0]).propose(
        [tokenGouv.target],
        [0],
        [encodedFunction],
        "Test proposal"
      )).to.be.revertedWithCustomError(governorContract, "GovernorInsufficientProposerVotes")


    });
});

  describe("getNumberOfProposals", function () {
    it("Should return the number of proposals", async function () {
      const { governorContract, signers, tokenGouv, targetContract } = await loadFixture(deployGovernorContractWithIco);
      const encodedFunction = tokenGouv.interface.encodeFunctionData("transferEth", [targetContract.target, "10"]);
      const proposalTx = await governorContract.connect(signers[1]).propose(
        [targetContract.target],
        [0],
        [encodedFunction],
        "Test proposal"
      )
      await proposalTx.wait();
      expect(await governorContract.getNumberOfProposals()).to.equal(1);
  });
  });

  describe("votes", function () {
    it("Should vote for a proposal", async function () {
      const { governorContract, signers, tokenGouv, targetContract } = await loadFixture(deployGovernorContractWithIco);
      
      // Création de la proposition
      const encodedFunction = tokenGouv.interface.encodeFunctionData("transferEth", [targetContract.target, "10"]);
      const proposalTx = await governorContract.connect(signers[1]).propose(
        [tokenGouv.target],
        [0],
        [encodedFunction],
        "Test proposal"
      )
      const proposeReceipt = await proposalTx.wait();
      const proposalId = proposeReceipt.logs[0].args[0].toString();
  
      // Simuler le passage du temps jusqu'à la période de vote
      await moveBlocks(VOTING_DELAY + 1);
  
      // Vérifier si la proposition est maintenant "Active"
      const currentState = await governorContract.state(proposalId);
      expect(currentState).to.equal(1); // 1 représente "Active"
  
      const voteWay = 1; // Pour le vote
      const reason = "I vote yes for the test";
  
      // Effectuer le vote
      const voteTx = await governorContract.connect(signers[1]).castVoteWithReason(proposalId, voteWay, reason);
      await voteTx.wait();

      // Vérifier si le compte a voté
      expect(await governorContract.hasVoted(proposalId, signers[1].address)).to.be.true;

      // Obtenir les totaux de votes pour la proposition
      const { againstVotes, forVotes, abstainVotes } = await governorContract.proposalVotes(proposalId);

      // Vérifier les totaux de votes
      expect(forVotes).to.be.greaterThan(0);

    }); 
  });

  describe("queue and execute", function () {
    it("Should have the correct state", async function () {
        const { governorContract, tokenGouv, targetContract, proposalId, signers } = await loadFixture(deployGovernorContractWithProposeAndVoteDone);
        const proposalState = await governorContract.state(proposalId);
        expect(proposalState).to.equal(4); // 4 représente "Succeeded"

    });

    it("Should queue and execute a proposal", async function () {
        const { governorContract, tokenGouv, targetContract, proposalId, signers } = await loadFixture(deployGovernorContractWithProposeAndVoteDone);

        const functionToCall = "transferEth";
        const encodedFunction = tokenGouv.interface.encodeFunctionData(functionToCall, [targetContract.target, "10"]);
        const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes("Test proposal"))

        const queueTx = await governorContract.queue([tokenGouv.target], [0], [encodedFunction], descriptionHash);
        await queueTx.wait();

        await moveTime(MIN_DELAY + 1);
        await moveBlocks(1);

        expect(await governorContract.state(proposalId)).to.equal(5); // 5 représente "Queued"

        const executeTx = await governorContract.execute([tokenGouv.target], [0], [encodedFunction], descriptionHash);
        await executeTx.wait(1);

        
    });
  });

  describe("proposalNeedsQueuing", function () {
    it("Should require queuing for a proposal", async function () {

        const { governorContract, proposalId } = await loadFixture(deployGovernorContractWithProposeAndVoteDone);


        expect(await governorContract.proposalNeedsQueuing(proposalId)).to.equal(true);
    });
  });

  describe("Cancel a proposal", function () {
    it("Should cancel a proposal", async function () {
        const { governorContract, tokenGouv, targetContract, proposalId, signers } = await loadFixture(deployGovernorContractWithProposalCreated);

        const description = "Test proposal";
        const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(description));
        const encodedFunction = tokenGouv.interface.encodeFunctionData("transferEth", [targetContract.target, "10"]);

         // Tenter d'annuler la proposition
         expect ( await governorContract.connect(signers[1]).cancel(
            [tokenGouv.target],
            [0],
            [encodedFunction],
            descriptionHash
        )).to.emit(governorContract,"ProposalCanceled")
        .withArgs(proposalId);
         expect(await governorContract.state(proposalId)).to.equal(2); // 2 représente "Canceled"
    });
  });
});
