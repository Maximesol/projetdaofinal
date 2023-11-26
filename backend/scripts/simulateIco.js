const hre = require("hardhat");
const fs = require('fs');


async function simulateICO() {
    const signers = await hre.ethers.getSigners();
    const {tokenGouvAddress } = JSON.parse(fs.readFileSync('deployedAddresses.json', 'utf8'));
    const tokenGouv = await hre.ethers.getContractAt("TokenGouv", tokenGouvAddress, signers[0].address);
    

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

        console.log(`Participant ${participant.signer.address} buying tokens with ${participant.ethAmount} ETH`);
        const buyTokensTx = await tokenGouv.connect(participant.signer).buyTokens({ value: ethAmount });
        await buyTokensTx.wait();

    }

    
    const contractEthBalance = await hre.ethers.provider.getBalance(tokenGouvAddress);
    console.log(`Balance en ETH du contrat TokenGouv: ${hre.ethers.formatEther(contractEthBalance)} ETH`);

    console.log("ICO simulation completed.");
}

simulateICO()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
