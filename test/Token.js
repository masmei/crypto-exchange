const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};
describe("Token contract", () => {
  let token, accounts, deployer, receiver, exchange;

  beforeEach(async () => {
    //Before each test this gets ran...
    //fetch token from blockchain
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("Monie", "MON", "1000000");

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    receiver = accounts[1];
    exchange = accounts[2];
  });

  describe("Deployment", () => {
    const name = "Monie";
    const symbol = "MON";
    const decimals = 18;
    const totalSupply = tokens("1000000");

    it("has the correct name", async () => {
      //check that name is correct
      expect(await token.name()).to.equal(name);
    });

    it("has the correct symbol", async () => {
      //check that symbol is correct
      expect(await token.symbol()).to.equal(symbol);
    });

    it("has the correct decimals", async () => {
      //check that symbol is correct
      expect(await token.decimals()).to.equal(decimals);
    });

    it("has the correct decimals", async () => {
      //check that symbol is correct
      expect(await token.totalSupply()).to.equal(totalSupply);
    });

    it("assigns total supply to deployer", async () => {
      //check that symbol is correct
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
    });
  });

  describe("Token Transfer", () => {
    let amount, transaction, result;

    describe("Success", () => {
      beforeEach(async () => {
        amount = tokens(100);
        transaction = await token
          .connect(deployer)
          .transfer(receiver.address, amount);
        result = await transaction.wait();
      });

      it("transfers token balances", async () => {
        expect(await token.balanceOf(deployer.address)).to.equal(
          tokens(999900)
        );
        expect(await token.balanceOf(receiver.address)).to.equal(amount);
      });

      it("emits a transfer event", async () => {
        const event = result.events[0];
        expect(event.event).to.equal("Transfer");

        const args = event.args;
        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(receiver.address);
        expect(args.value).to.equal(amount);
      });
    });
  });

  describe("Failure", () => {
    it("rejects insufficient balances", async () => {
      //Transfer more tokens than deployer has
      const invalidAmount = tokens(10000000000);
      await expect(
        token.connect(deployer).transfer(receiver.address, invalidAmount)
      ).to.be.reverted;
    });

    it("rejects invalid recipent", async () => {
      const amount = tokens(100);
      await expect(
        token
          .connect(deployer)
          .transfer("0x0000000000000000000000000000000000000000", amount)
      ).to.be.reverted;
    });
  });

  describe("Approving Tokens", () => {
    let amount, transaction, result;

    beforeEach(async () => {
      amount = tokens(100);
      transaction = await token
        .connect(deployer)
        .approve(exchange.address, amount);
      result = await transaction.wait();
    });
    describe("Success", () => {
      it("allocates an allowance for delegated token spending", async () => {
        expect(
          await token.allowance(deployer.address, exchange.address)
        ).to.equal(amount);
      });

      it("emits an approval event", async () => {
        const event = result.events[0];
        expect(event.event).to.equal("Approval");

        const args = event.args;
        expect(args.owner).to.equal(deployer.address);
        expect(args.spender).to.equal(exchange.address);
        expect(args.value).to.equal(amount);
      });
    });

    describe("Failure", () => {
      it("rejects invalid spenders", async () => {
        await expect(
          token
            .connect(deployer)
            .approve("0x0000000000000000000000000000000000000000", amount)
        ).to.be.reverted;
      });
    });
  });

  describe("Delegated Token Transfers", () => {
    let amount, transaction, result;

    beforeEach(async () => {
      amount = tokens(100);
      transaction = await token
        .connect(deployer)
        .approve(exchange.address, amount);
      result = await transaction.wait();
    });

    describe("Success", () => {
      beforeEach(async () => {
        transaction = await token
          .connect(exchange)
          .transferFrom(deployer.address, receiver.address, amount);
        result = await transaction.wait();
      });

      it("transfers token balances", async () => {
        expect(await token.balanceOf(deployer.address)).to.equal(
          tokens(999900)
        );
        expect(await token.balanceOf(receiver.address)).to.equal(amount);
      });

      it("resets the allowance", async () => {
        expect(
          await token.allowance(deployer.address, exchange.address)
        ).to.be.equal(0);
      });

      it("emits a transfer event", async () => {
        const event = result.events[0];
        expect(event.event).to.equal("Transfer");

        const args = event.args;
        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(receiver.address);
        expect(args.value).to.equal(amount);
      });
    });

    describe("Failure", () => {
      it("rejects invalid amount of tokens", async () => {
        //Attempt to transfer too many tokens
        const invalidAmount = tokens(100000000);
        await expect(
          token
            .connect(exchange)
            .transferFrom(deployer.address, receiver.address, invalidAmount)
        ).to.be.reverted;
      });
    });
  });
});
