// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TRESToken is ERC20 {

    //100000000000000000000000,default ERC20 decimal is 18
    constructor(uint256 initialSupply) ERC20("TRES Token", "TRES") {
        _mint(msg.sender, initialSupply);
    }
}