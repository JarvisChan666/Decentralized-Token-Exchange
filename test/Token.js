
const { TokenClass } = require("typescript")
const { ethers } = require("hardhat")//import ethers from hardhat
const { expect } = require("chai") 

//change ether to wei
const tokens = (n) => { //Arrow functions are convenient defining short functions.
    return ethers.utils.parseUnits(n.toString(), 'ether')
}



describe('Token', () => {
    let token, accounts, deployer

    beforeEach(async () => {
        //execuit first
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Jarvis', 'JVC', 1000000)//deploy it,get the name 
    
        accounts = await ethers.getSigners()
        deployer = accounts[0];
    })
    describe('Deployment', () => {
        const name = 'Jarvis'
        const symbol = 'JVC'
        const decimals = '18'
        const totalSupply = tokens('1000000')

        it('has correct name', async () => {
            //Check that name is correct
            expect(await token.name()).to.equal(name) 
        })
    
        it('has correct symbol', async () => {
            //Check that name is correct
            expect(await token.symbol()).to.equal(symbol) 
        })
    
        it('has correct decimals', async () => {
            //Check that name is correct
            expect(await token.decimals()).to.equal(decimals) 
        })
    
        it('has correct totalSupply', async () => {
            //Check that name is correct
            //change ether to wei
            expect(await token.totalSupply()).to.equal(totalSupply) 
        })
        
        it('assign total supply to deployer', async () => {
            //Check that name is correct
            //change ether to wei
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply) 
        })
    
    })


}) 
