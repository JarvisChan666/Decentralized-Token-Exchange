
const { TokenClass } = require("typescript")
const { ethers } = require("hardhat")//import ethers from hardhat
const { expect } = require("chai") 

//change ether to wei
const tokens = (n) => { //Arrow functions are convenient defining short functions.
    return ethers.utils.parseUnits(n.toString(), 'ether')
}



describe('Token', () => {
    let token, accounts, deployer, receiver, exchange

    beforeEach(async () => {
        //execuit first
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Jarvis', 'JVC', 1000000)//deploy it,get the name 
    
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
        exchange = accounts[2]
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

    describe('Sending Token', () => {

        let amount, transaction, result

        describe('Success', () => {
            beforeEach(async () => {
                amount = tokens(100)
                let transaction = await token.connect(deployer).transfer(receiver.address, amount)
                result = await transaction.wait()
            })
            it('Transfers token balances', async() => {
               
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
                
            })
    
            it('Emit a transfer event', async () => {
                const event = result.events[0]
                expect(event.event).to.equal('Transfer')
               
                const args = event.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(receiver.address)
                expect(args.value).to.equal(amount)
            })
        })
        
        describe('Failure', () => {
            it('rejects insufficient balances', async () => {
                //Transfer more tokens than deployer has - 10m
                const invalideAmount = tokens(100000000)
                await expect(token.connect(deployer).transfer(receiver.address, invalideAmount)).to.be.reverted
            })
            it('rejects invalid recipent', async () => {
                const amount = tokens(100)
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
            
        })
        
    })

    describe('Approving Tokens', () => {
        let amount, transaction, result
        beforeEach(async () => {
            amount = tokens(100)
            transaction = await token.connect(deployer).transfer(exchange.address, amount)
            result = await transaction.wait()
        })
    
        describe('Success', async () => {
            it('allocates an allowance for delegated token spend')
            expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
            
            it('Emit an approval event', async () => {
                const event = result.events[0]
                expect(event.event).to.equal('Approval')
               
                const args = event.args
                expect(args.owner).to.equal(deployer.address)
                expect(args.spender).to.equal(exchange.address)
                expect(args.value).to.equal(amount)
            })
        
        
        })

        
       

        describe('Faliure', () => {
            it('rejects invalid spender', async () =>{
                await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })
    })
}) 


