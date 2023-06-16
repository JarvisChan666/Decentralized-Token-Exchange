//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    
    struct _Order {
        uint256 id,//unique identifier for order
        address user,// user who made order 
        address tokenGet,//address of the token they receive
        uint256 amountGet,//amount they receive
        address tokenGive,//address of tokenthey give
        uint256 amountGive,//amount they give
        uint256 timestamp;
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
   
    function depositToken(address _token, uint256 _amount) public {
       
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
    
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
       //ensure user have enough token to withdrwaw
       require(tokens[_token][msg.sender] >= _amount);
       
        Token(_token).transfer(msg.sender, _amount);

        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;
    
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);(_token, msg.sender, _amount, tokens[_token][msg.sender]);

    }
    function balanceOf(address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];
    }


    function makeOrder(
        address _tokenGet, 
        uint256 _amountGet, 
        address _tokenGive, 
        address _amountGive
        ) public {

        // uint256 id;//unique identifier for order
        // address user;// user who made order 
        // address tokenGet;//address of the token they receive
        // uint256 amountGet;//amount they receive
        // address tokenGive;//address of tokenthey give
        // uint256 amountGive;//amount they give
        // uint256 timestamp;

        orderCount = orderCount + 1;

         orders[orderCount] = _Order(
            orderCount, // id
            msg.sender, // user
            _tokenGet, // tokenGet
            _amountGet, //amountGet
            _tokenGive, // tokenGive
            _amountGive, //amountGive
            block.timestamp      
        );
    }
}
