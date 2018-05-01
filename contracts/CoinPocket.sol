pragma solidity ^0.4.17;

contract CoinPocket {
    
    event txlog(string dtypes, string action, uint amount);

    uint constant DTYPELEN = 2;
    string[] dtypes = ["TWD", "USD"];
    enum DollarType{
        TWD, USD, _END
    }

    struct Account {
        uint[DTYPELEN] dollar;
    }
    
    constructor() public{
        users[this].dollar[uint(DollarType.TWD)] = 5000;
        users[this].dollar[uint(DollarType.USD)] = 3000;
    }
    
    mapping (address => Account) users;
    
    modifier checkType(uint dtype){
        require(dtype>=0 && dtype<dtypes.length
            && DTYPELEN == dtypes.length
            && DTYPELEN == uint(DollarType._END)-1
            , "dtype error!");
        _;
    }
    
    modifier enought(uint dtype, uint amount){
        require(users[msg.sender].dollar[dtype]>=amount
            , "insufficient balance!");
        require(users[this].dollar[dtype]>=amount
            , "insufficient balance of contract!!!");
        _;
    }

    function deposit(uint dtype, uint amount) checkType(dtype) public{
        users[msg.sender].dollar[dtype] += amount;
        users[this].dollar[dtype] += amount;
        emit txlog(dtypes[dtype], "deposit", amount);
    }
    
    function withdraw(uint dtype, uint amount) checkType(dtype) enought(dtype, amount) public{
        users[msg.sender].dollar[dtype] -= amount;
        users[this].dollar[dtype] -= amount;
        emit txlog(dtypes[dtype], "withdraw", amount);
    }
    
    function detail() constant public returns(uint[DTYPELEN]){
        return users[msg.sender].dollar;
    }

    function detail_pool() constant public returns(uint[DTYPELEN]){
        return users[this].dollar;
    }
    
    function sayHello() pure public returns(string){
        return "~~Hello~~";
    }
}

