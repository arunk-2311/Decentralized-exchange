const fs =require("fs");

const FRONT_END_ADDRESSES_LOCATION = "../tokenexchange-frontend/constants/contractAddresses.json"
const FRONT_END_ABI_LOCATION = "../tokenexchange-frontend/constants/ABIs.json"


// module.exports = async function(name,address,abi){
//     if(process.env.UPDATE_FRONT_END){
//         console.log(`updating front end`)
//     }
//     updateFrontEnd(name,address,abi)
// }

module.exports = function(contractName,contractAddress,contractABI){
    const currentAddresses = JSON.parse(fs.readFileSync(FRONT_END_ADDRESSES_LOCATION,"utf8"))
    const currentAbis = JSON.parse(fs.readFileSync(FRONT_END_ABI_LOCATION,"utf8"))
    const chainID = '1337'

    // Addresses
    const jsonAddress = {[contractName]:contractAddress}
    if(chainID in currentAddresses){
        currentAddresses[chainID][contractName] = contractAddress
    }else{
        currentAddresses[chainID] = jsonAddress
    }
    fs.writeFileSync(FRONT_END_ADDRESSES_LOCATION,JSON.stringify(currentAddresses))

    // Abis
    const jsonAbi = {[contractName]:contractABI}
    if(chainID in currentAbis){
        currentAbis[chainID][contractName] = contractABI
    }else{
        currentAbis[chainID] = jsonAbi
    }
    fs.writeFileSync(FRONT_END_ABI_LOCATION,JSON.stringify(currentAbis))
}