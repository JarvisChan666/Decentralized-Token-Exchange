//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
 
    //token -> user -> how many token the user have. 
    // Use this map to track the token amount that the user have 
    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    mapping(uint256 => bool) public orderCancelled; //true or fall bool value
    mapping(uint256 => bool) public orderFilled;


    event Deposit(
        address token, 
        address user, 
        uint256 amount, 
        uint256 balance
    );

    event Withdraw(
        address token, 
        address user, 
        uint256 amount, 
        uint256 balance
    );
    
    event Order (
        uint256 id,//unique identifier for order
        address user,// user who made order 
        address tokenGet,//address of the token they receive
        uint256 amountGet,//amount they receive
        address tokenGive,//address of tokenthey give
        uint256 amountGive,//amount they give
        uint256 timestamp
    );

    event Trade (
        uint256 id,//unique identifier for order
        address user,// user who take order 
        address tokenGet,//address of the token they receive
        uint256 amountGet,//amount they receive
        address tokenGive,//address of tokenthey give
        uint256 amountGive,//amount they give
        address creator,//who create morder
        uint256 timestamp
    );

    event Cancel (
        uint256 id,//unique identifier for order
        address user,// user who made order 
        address tokenGet,//address of the token they receive
        uint256 amountGet,//amount they receive
        address tokenGive,//address of tokenthey give
        uint256 amountGive,//amount they give
        uint256 timestamp
    );

    struct _Order {
        uint256 id;//unique identifier for order
        address user;// user who made order 
        address tokenGet;//address of the token they receive
        uint256 amountGet;//amount they receive
        address tokenGive;//address of tokenthey give
        uint256 amountGive;//amount they give
        uint256 timestamp;
    }

    //initialize a smart contract during deployment
    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
   
    //transferFrom, user approve(authorize) exchange to "spend" user's token
    //wrap "transferFrom" to spend up to amount tokens on user behalf.
    function depositToken(address _token, uint256 _amount) public {
        //transfer amount _token from exchange(this) to user 
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
    
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    //withdraw amount token
    function withdrawToken(address _token, uint256 _amount) public {
        //ensure user have enough token to withdrwaw, check how many token the user have
        require(tokens[_token][msg.sender] >= _amount);
       
        //the user call transfer(to, value), 
        //then exchange call _transfer() to trans _token to user 
        Token(_token).transfer(msg.sender, _amount);
        //the token amount in user wallet(in exchange) decrease
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;
    
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);(_token, msg.sender, _amount, tokens[_token][msg.sender]);

    }

    //check the user balance of tokens 
    function balanceOf(address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];
    }

    //make order
    function makeOrder(
        address _tokenGet, //get which token
        uint256 _amountGet, //get how many
        address _tokenGive, //which way(token) you use to trade(pay)? 
        uint256 _amountGive //the amount user want to trade
        ) public {
        //require user have enough token balance
        require(balanceOf(_tokenGive, msg.sender) == _amountGive);
        //instantiate new order
        orderCount ++;
        orders[orderCount] = _Order(
            orderCount, // id
            msg.sender, // user
            _tokenGet, // tokenGet 
            _amountGet, //amountGet
            _tokenGive, // tokenGive
            _amountGive, //amountGive
            block.timestamp      
        );

        //emit event
        emit Order (
            orderCount, // id
            msg.sender, // user
            _tokenGet, // tokenGet
            _amountGet, //amountGet
            _tokenGive, // tokenGive
            _amountGive, //amountGive
            block.timestamp  
        );      
    }

    function cancelOrder(uint256 _id) public {
        //fetch order
        _Order storage _order = orders[_id];
        //cancel the order

        require(address(_order.user) == msg.sender);

        require(_order.id == _id);

        orderCancelled[_id] = true;
        
        emit Cancel (
        _order.id, // id
        msg.sender, // user
        _order.tokenGet, // tokenGet
        _order.amountGet, //amountGet
        _order.tokenGive, // tokenGive
        _order.amountGive, //amountGive
        block.timestamp  
        );
    }

    //execute orde

    function fillOrder(uint256 _id) public {
        //valid id
        require(_id > 0 && _id <= orderCount, "Order does not exist");
        //can't be filled
        require(!orderFilled[_id]);
        //can't be cancelled
        require(!orderCancelled[_id]);

        //fetch order
        _Order storage _order = orders[_id];

        _trade(
            _order.id,
            _order.user,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive
        );

        orderFilled[_order.id] =  true;
        //swappingTokens
    }
    

    function _trade(
        uint256 _orderId, 
        address _user,
        address _tokenGet, 
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
        ) internal {

            uint256 _feeAmount = (_amountGet * feePercent) / 100;

            //assume user1 is the one who get 
            tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] - _amountGet - _feeAmount;//user2 mDAI
            
            tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;//user1 mDAI

            tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + _feeAmount;

            tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;

            tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender] + _amountGive;

            //emit trade event
            emit Trade(
                _orderId,
                msg.sender,
                _tokenGet,
                _amountGet,
                _tokenGive,
                _amountGive,
                _user,
                block.timestamp
            );
    }
}
