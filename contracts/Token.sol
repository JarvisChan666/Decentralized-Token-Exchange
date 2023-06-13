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
    
    event Transfer(
        address indexed from , 
        address indexed to, 
        uint256 value 
    );

    //send token


    constructor
    (string memory _name, string memory _symbol, uint256 _totalSupply
    ) {
        name = _name; //Token.deploy('Jarvis')
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        //msg is global value,sender is the account who is deploying this contract?
        balanceOf[msg.sender] = totalSupply;//mapping use []
    }

    function transfer(address _to, uint256 _value) 
        public 
        returns (bool success) 
    {
        //require that sender have enough token to spend
        require(balanceOf[msg.sender] >= _value);
        

        // deduct token from spender
        balanceOf[msg.sender]  = balanceOf[msg.sender] - _value;
        //credit token to receiver
        balanceOf[_to] = balanceOf[_to] + _value;
        
        //emit event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}


