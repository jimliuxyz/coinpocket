pragma solidity ^0.4.17;

contract CoinPocket {
    
    event txlog(string dtypes, string action, uint amount, address sender, address receiver);

    uint constant DTYPELEN = 2;
    string[] dtypes = ["TWD", "USD"];
    enum DollarType{
        TWD, USD, _length
    }

    struct Account {
        uint[DTYPELEN] dollar;
    }
    
    address public minter;
    
    constructor() public{
        minter = msg.sender;
        //keyword 'this' means 'contract account'
        
        users[minter].dollar[uint(DollarType.TWD)] = 10000;
        users[minter].dollar[uint(DollarType.USD)] = 10000;
    }
    
    mapping (address => Account) users;
    
    modifier checkType(uint dtype){
        require(dtype>=0 && dtype<dtypes.length
            && DTYPELEN == dtypes.length
            && DTYPELEN == uint(DollarType._length)
            , "dtype error!");
        _;
    }
    
    modifier enought(uint dtype, uint amount){
        require(users[msg.sender].dollar[dtype]>=amount
            , "insufficient balance!");
        _;
    }

    //mint for free
    function deposit(uint dtype, uint amount) checkType(dtype) public{
        users[msg.sender].dollar[dtype] += amount;
        emit txlog(dtypes[dtype], "deposit", amount, msg.sender, msg.sender);
    }
    
    function withdraw(uint dtype, uint amount) checkType(dtype) enought(dtype, amount) public{
        users[msg.sender].dollar[dtype] -= amount;
        emit txlog(dtypes[dtype], "withdraw", amount, msg.sender, msg.sender);
    }
    
    function transfer(uint dtype, uint amount, address receiver)checkType(dtype) enought(dtype, amount) public{
        users[msg.sender].dollar[dtype] -= amount;
        users[receiver].dollar[dtype] += amount;
        emit txlog(dtypes[dtype], "transfer", amount, msg.sender, receiver);
    }
    
    function detail() constant public returns(uint[DTYPELEN]){
        return users[msg.sender].dollar;
    }

    function detail_minter() constant public returns(uint[DTYPELEN]){
        return users[minter].dollar;
    }
    
    function wei_balance() constant public returns(uint){
        return msg.sender.balance;
    }
    
    function sayHello() pure public returns(string){
        return "~~Hello~~";
    }
}

