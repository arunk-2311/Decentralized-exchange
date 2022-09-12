// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UNOToken is ERC20 {

    //100000000000000000000000,default ERC20 decimal is 18
    constructor(uint256 initialSupply) ERC20("UNO Token", "UNO") {
        _mint(msg.sender, initialSupply);
    }
}