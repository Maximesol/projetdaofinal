const hre = require("hardhat");
const fs = require('fs');


async function checkCirculatingSupply() {
    const { tokenGouvAddress } = JSON.parse(fs.readFileSync('deployedAddresses.json', 'utf8'));
    const tokenGouv = await hre.ethers.getContractAt("TokenGouv", tokenGouvAddress);

    const circulatingSupply = await tokenGouv.totalSupply();
    console.log(`Circulating Supply: ${hre.ethers.formatEther(circulatingSupply)} DCP`);
}

checkCirculatingSupply()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
