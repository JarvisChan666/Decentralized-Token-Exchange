// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.9;

import "../node_modules/hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint256 public decimals = 18;//dont change
    uint256 public totalSupply;

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name; //Token.deploy('Jarvis')
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
    }



}


