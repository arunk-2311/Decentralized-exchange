// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const { rand } = require("elliptic");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { exact } = require("io-ts");

// an async function.
describe("Exchange contract", function () {
  let uno;
  let duo;
  let exchange;
  let unoOwner;
  let exchangeOwner;
  let random;
  let buyer;
  let duoOwner;

  // to pass big number!
  function tokenize(s){
    return ethers.utils.parseEther(s)
  }

  async function balanceChecks(_unoBalance,_duoBalance,_etherBalance){
      // Balance checks

      const unoBalance = await uno.balanceOf(exchange.address);
      expect(unoBalance).to.equal(tokenize(_unoBalance));
      const duoBalance = await duo.balanceOf(exchange.address);
      expect(duoBalance).to.equal(tokenize(_duoBalance));
      const etherBalance = await exchange.provider.getBalance(exchange.address);
      expect(etherBalance).to.equal(tokenize(_etherBalance));
  }

  async function tokenInfoChecks(_price,_circulation,_reward){
    // Check Data structures
    let data= await exchange.trackTokenInfo(uno.address);
    expect(data[0]).to.equal(tokenize(_price));
    expect(data[1]).to.equal(tokenize(_circulation));
    expect(data[2]).to.equal(tokenize(_reward));
  }

  const supplyTest = tokenize("100000")
  const transferTest = tokenize("10000")
  const approveTest = tokenize("1000")

  // Deploy UNO,DUO tokens and Exchange contract
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    let unoToken = await ethers.getContractFactory("UNOToken");
    let duoToken = await ethers.getContractFactory("DUOToken");
    let exchangeContract = await ethers.getContractFactory("Exchange");

    [exchangeOwner,unoOwner,buyer,duoOwner,random] = await ethers.getSigners();

    uno = await unoToken.connect(unoOwner).deploy(supplyTest);
    duo = await duoToken.connect(duoOwner).deploy(supplyTest);
    uno.connect(unoOwner).transfer(random.address,transferTest)
    duo.connect(duoOwner).transfer(random.address,transferTest)
    exchange =  await exchangeContract.deploy()

    // Transfer 10 uno tokens from unoOwner to exchange contract
    uno.connect(unoOwner).approve(exchange.address,approveTest);
    uno.connect(random).approve(exchange.address,approveTest);

    // Transfer 20 duo tokens from unoOwner to exchange contract
    duo.connect(duoOwner).approve(exchange.address,approveTest);
    duo.connect(random).approve(exchange.address,approveTest);

  });

  describe("Deployment check", function () {
    it("Should assign the total supply of tokens to the owner", async function () {
      const unoOwnerBalance = await uno.balanceOf(unoOwner.address);
      const duoOwnerBalance = await duo.balanceOf(duoOwner.address);
      const unoTotalSupply = await uno.totalSupply();
      const duoTotalSupply = await duo.totalSupply();

      // Handle big numbers
      expect((BigInt(unoTotalSupply.toString())-BigInt(transferTest.toString()))).to.equal(unoOwnerBalance);
      expect((BigInt(duoTotalSupply.toString())-BigInt(transferTest.toString()))).to.equal(duoOwnerBalance);
    });
  });

  describe("Transactions", function () {

    // AddToken transaction
    it("should transfer tokens to exchange contract", async function () {

      await exchange.connect(unoOwner).AddToken(uno.address,tokenize("10.0"),{
        value: tokenize("2.0"), // Sends exactly 2.0 ether
      });

      await exchange.connect(duoOwner).AddToken(duo.address,tokenize("20.0"),{
        value: tokenize("1.0"), // Sends exactly 1.0 ether
      });

      // Second transfer
      await exchange.connect(random).AddToken(uno.address,tokenize("40.0"),{
        value: tokenize("3.0"), // Sends exactly 3.0 ether
      });
      await exchange.connect(random).AddToken(duo.address,tokenize("80.0"),{
        value: tokenize("4.0"), // Sends exactly 4.0 ether
      });

      await balanceChecks("50","100","10");

      await tokenInfoChecks("0.1","50","0");

      // BuyToken check
      await exchange.connect(random).BuyToken(uno.address,tokenize("10.0"),{
        value: tokenize("2"), // Sends exactly 2 ether
      });

      await balanceChecks("40","100","12");

      await tokenInfoChecks("0.15","40","2");

      await exchange.connect(buyer).BuyToken(uno.address,tokenize("20.0"),{
        value: tokenize("3.0"), // Sends exactly 1.5 ether
      });
      await balanceChecks("20","100","15");
      await tokenInfoChecks("0.3","20","5");

      // Withdraw Reward
      await exchange.connect(random).withdrawReward(uno.address,tokenize("0.8"));

      // const unoByRandom = await exchange.connect(random).trackTokenAmt(random.address,uno.address);
      // const totalUno = await exchange.connect(random).contributedToken(uno.address);    
      // console.log(unoByRandom);
      // console.log(totalUno);
      // console.log((unoByRandom/totalUno)*tokenize("5"));
      // console.log(tokenize("0.8"))

      await balanceChecks("20","100","14.2");
      await tokenInfoChecks("0.3","20","4.2");

      // Swap token 
      const duoBeforeSwapping = await duo.balanceOf(random.address) 
      await exchange.connect(random).swapToken(uno.address,tokenize("5"),duo.address);
      await balanceChecks("25","70","14.2");
      await tokenInfoChecks("0.3","25","4.2");
      // "10000-80+30 = 9950"
      expect(await duo.balanceOf(random.address)).to.equal(tokenize("9950"));      

    });
  });
});

/* 

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Not enough tokens");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await hardhatToken.transfer(addr1.address, 100);

      // Transfer another 50 tokens from owner to addr2.
      await hardhatToken.transfer(addr2.address, 50);


      // Check balances.
      const finalOwnerBalance = await hardhatToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await hardhatToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
*/