const { ethers } = require("hardhat")
const { expect } = require("chai")

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether")
}
describe("Token contract", () => {
    let token
    
    beforeEach( async () => {
        //Before each test this gets ran...
        //fetch token from blockchain
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Monie", "MON", "1000000");
    })

    describe("Deployment", () => {
        const name = "Monie";
        const symbol = "MON";
        const decimals = 18;
        const totalSupply = "1000000";

        it("has the correct name", async () => {
            //check that name is correct
            expect(await token.name()).to.equal(name);
        })
    
        it("has the correct symbol", async () => {
            //check that symbol is correct
            expect(await token.symbol()).to.equal(symbol);
        })
    
        it("has the correct decimals", async () => {
            //check that symbol is correct
            expect(await token.decimals()).to.equal(decimals);
        })
    
        it("has the correct decimals", async () => {
            //check that symbol is correct
            expect(await token.totalSupply()).to.equal(tokens(totalSupply));
        })
    })

})

