// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract QUADToken is ERC20 {
    
    //100000000000000000000000,default ERC20 decimal is 18
    constructor(uint256 initialSupply) ERC20("QUAD Token", "QUAD") {
        _mint(msg.sender, initialSupply);
    }
}