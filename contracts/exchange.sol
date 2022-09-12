// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Exchange{

    struct tokenInfo{
        uint256 tokenPrice;
        uint256 tokenCirculation;
        uint256 reward;
    }

    // tokenAddress => tokenInfo
    mapping(address => tokenInfo) public trackTokenInfo;

    // sellerAddress => tokenAddress => tokenAmt
    mapping(address=>mapping(address=>uint256)) public trackTokenAmt;

    // sellerAddress => tokenAddress => collateral
    mapping(address=>mapping(address=>uint256)) public trackCollateral;

    // tokenAddress => contributedAmt
    mapping(address=>uint256) public contributedToken;

    // mode 0=add,1=buy
    modifier calcPrice(address _tokenAddress,uint256 _amt,uint256 _ethVal,uint256 mode){

        uint256 perTokenVal = (_ethVal * 10**18)/_amt;
        if(mode == 0){
            require(_ethVal !=0,"Collateral cannot be zero");
            trackTokenInfo[_tokenAddress].tokenPrice = (trackTokenInfo[_tokenAddress].tokenCirculation*trackTokenInfo[_tokenAddress].tokenPrice + _amt*perTokenVal)/((trackTokenInfo[_tokenAddress].tokenCirculation + _amt));
        }
        if(mode == 1){
            require(trackTokenInfo[_tokenAddress].tokenCirculation >= _amt,"Not enough tokens to buy!");
            trackTokenInfo[_tokenAddress].tokenPrice = ((trackTokenInfo[_tokenAddress].tokenCirculation-_amt)*trackTokenInfo[_tokenAddress].tokenPrice + _amt*perTokenVal)/((trackTokenInfo[_tokenAddress].tokenCirculation - _amt));
        }
        _;
    }

    // collateral is passed as msg.value
    function AddToken(address _tokenAddress,uint256 _tokenAmt) public payable calcPrice(_tokenAddress,_tokenAmt,msg.value,0){
        IERC20 token = IERC20(_tokenAddress);

        // sell the token to the contract
        token.transferFrom(msg.sender,address(this),_tokenAmt);
        trackTokenAmt[msg.sender][_tokenAddress] += _tokenAmt;

        // Calculate token circulation and total contributed token
        trackTokenInfo[_tokenAddress].tokenCirculation += _tokenAmt;
        contributedToken[_tokenAddress] += _tokenAmt;

        // Get eth as collateral
        trackCollateral[msg.sender][_tokenAddress] += msg.value;

    }

    function BuyToken(address _tokenAddress,uint256 _tokenAmt) public payable calcPrice(_tokenAddress,_tokenAmt,msg.value,1){
        IERC20 token = IERC20(_tokenAddress);

        // remove the sold token from circulation
        trackTokenInfo[_tokenAddress].tokenCirculation -= _tokenAmt;

        // add the eth value to rewards
        trackTokenInfo[_tokenAddress].reward += msg.value;

        // transfer the tokens to the buyer
        token.transfer(msg.sender,_tokenAmt);
    }

    function withdrawReward(address _tokenAddress,uint256 _ethAmt) public {

        // calculate user eligible reward
        uint256 ethReward = (trackTokenInfo[_tokenAddress].reward*trackTokenAmt[msg.sender][_tokenAddress])/contributedToken[_tokenAddress];

        // check if withdraw is possible
        require(ethReward >= _ethAmt,"You are not eligible for withdrawing your expected rewards!");
        trackTokenInfo[_tokenAddress].tokenPrice -= _ethAmt/trackTokenInfo[_tokenAddress].tokenCirculation;
        payable(msg.sender).transfer(_ethAmt);
        trackTokenInfo[_tokenAddress].reward -= _ethAmt;
    }

    function swapToken(address _givingTokenAddress,uint256 _givingTokenAmt,address _expectedTokenAddress) public {   
        uint256 priceVal = trackTokenInfo[_givingTokenAddress].tokenPrice*_givingTokenAmt;
        uint256 expectedTokenAmt = (priceVal)/trackTokenInfo[_expectedTokenAddress].tokenPrice;

        IERC20 givingToken = IERC20(_givingTokenAddress);
        IERC20 expectedToken = IERC20(_expectedTokenAddress);

        givingToken.transferFrom(msg.sender,address(this),_givingTokenAmt);
        expectedToken.transfer(msg.sender,expectedTokenAmt);

        trackTokenInfo[_givingTokenAddress].tokenCirculation += _givingTokenAmt;
        trackTokenInfo[_expectedTokenAddress].tokenCirculation -= expectedTokenAmt;
    }
}