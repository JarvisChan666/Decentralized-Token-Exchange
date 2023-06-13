// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.9;

import "../node_modules/hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint256 public decimals = 18;//dont change
    uint256 public totalSupply;

    //track balance put address, and show balance number
    mapping(address => uint256) public balanceOf;
    //send token


    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name; //Token.deploy('Jarvis')
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        //msg is global value,sender is the account who is deploying this contract?
        balanceOf[msg.sender] = totalSupply;//mapping use []
    }
}


