const {ethers} = require("hardhat");
const updateFrontEnd = require("./99-update-front-end");

// const chainID = network.config.chainId.toString()

// to pass big number!
function tokenize(s){
return ethers.utils.parseEther(s)
}

const supply = tokenize("100000")

async function deployToken(coinName){
  const Token = await ethers.getContractFactory(coinName);
  const token = await Token.deploy(supply);

  await token.deployed();
  console.log(`The ${coinName} is deployed at `, token.address);

  updateFrontEnd(coinName,token.address,token.interface.format(ethers.utils.FormatTypes.json))
}

async function main() {
  await deployToken("UNOToken")
  await deployToken("DUOToken")
  await deployToken("TRESToken")
  await deployToken("QUADToken")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
