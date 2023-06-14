// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.9;

import "../node_modules/hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint256 public decimals = 18;//dont change
    uint256 public totalSupply;

    //mapping like a key-value database
    //track balance put address, and show balance number
    mapping(address => uint256) public balanceOf;

    //msg.sender(receiver) approve an allowance(kuan xian) for spender
    //Then spender call tranferFrom() to spend receiver's tokens 
    //Store the authorization amount of each authorizer for each address
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(
        address indexed from , 
        address indexed to, 
        uint256 value 
    );

    event Approval(
        address indexed owner , 
        address indexed spender, 
        uint256 value 
    );

    //send token


    constructor
    (string memory _name, string memory _symbol, uint256 _totalSupply
    ) {
        name = _name; 
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
       
       //msg.sender is deployer's address, 
       //they are initial token holder
       //also can be receiver

       //The total supply is minted to the deployer's address
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) 
        public 
        returns (bool success) 
    {
    
        require(balanceOf[msg.sender] >= _value);
        require(_to != address(0));

    
        balanceOf[msg.sender]  = balanceOf[msg.sender] - _value;

        balanceOf[_to] = balanceOf[_to] + _value;
        
        emit Transfer(msg.sender, _to, _value);
        
        return true;
    }
    
    function approve(address _spender, uint256 _value) 
    public 
    returns(bool success) 
    {
        require(_spender != address(0));
    /*
    allowance' refers specifically to the amount of tokens
    that a token holder authorizes another address to spend.
    */
        allowance[msg.sender][_spender] = _value;
        
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
}


