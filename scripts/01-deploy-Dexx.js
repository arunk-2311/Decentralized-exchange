const {ethers}= require("hardhat");
const updateFrontEnd = require("./99-update-front-end");


// const CONTRACT_ADDRESSES_PATH = "./constants/addresses.json"
// const chainID = network.config.chainId.toString()

async function main() {
  const exchangeContract = await ethers.getContractFactory("Exchange");
  const exchange =  await exchangeContract.deploy()
  await exchange.deployed()
  console.log(`{"DEXX":${exchange.address}}`)
  const contractName = "Exchange"
  updateFrontEnd(contractName,exchange.address,exchange.interface.format(ethers.utils.FormatTypes.json))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
