const { expect } = require('chai');
const { ethers } = require('hardhat');
const { result } = require('lodash');
const { connect } = require('react-redux');
const { composeWithDevTools } = require('redux-devtools-extension');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')//n ether = n * 10 ** 18 wei
}

describe('Exchange', () => {
  let deployer, feeAccount, exchange, token1, token2, accounts, user1, user2

  const feePercent = 10

  beforeEach(async () => {
    //gets the factory for the Exchange contract
    /*
    calling ethers.getContractFactory('Exchange'), you're:
    Getting the bytecode and ABI for the compiled Exchange.sol contract
    Obtaining a "factory" that can instantiate and deploy Exchange contract instances
    Then, by calling .deploy() on that factory, you instantiate a new Exchange contract and deploy it to the blockchain.
    */
    const Exchange = await ethers.getContractFactory('Exchange')
    const Token = await ethers.getContractFactory('Token')
    //use DAPP to trade mDAI
    token1 = await Token.deploy('Dapp University', 'DApp', '1000000')
    token2 = await Token.deploy('Mock Dai', 'mDAI', '1000000')
    
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    feeAccount = accounts[1]// the exchange
    user1 = accounts[2]
    user2 = accounts[3]

    //any transactions called on token1 will now be signed by deployer.
    let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))
    //js "await" grammar: asynchronous codd. Wait for the previous line of code to run
    await transaction.wait()

    
    exchange = await Exchange.deploy(feeAccount.address, feePercent)
  })

  describe('Deployment', () => {

    it('tracks the fee account', async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address)
    })

    it('tracks the fee percent', async () => {
        expect(await exchange.feePercent()).to.equal(feePercent)
      })
  })

  describe('Depositing Tokens', () => {
    let transaction, result
    let amount = tokens(10)//10 ether
    
    describe('Success', () => {
        beforeEach(async () => {
          //user1 approve exchange to use "transferFrom()" 
          //to spend up to amount tokens on their behalf.
          transaction = await token1.connect(user1).approve(exchange.address, amount)
          result = await transaction.wait()
          //call transferFrom()
          transaction = await exchange.connect(user1).depositToken(token1.address, amount)
          result = await transaction.wait()
      })

        it('tracts the token deposit', async () => {
            expect(await token1.balanceOf(exchange.address)).to.equal(amount)
            expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
            expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
        })

        it('emit a Deposit event', async () => {
          const event = result.events[1]
          expect(event.event).to.equal('Deposit')

          const args = event.args
          expect(args.token).to.equal(token1.address)
          expect(args.user).to.equal(user1.address)
          expect(args.amount).to.equal(amount)
          expect(args.balance).to.equal(amount)
        })
    })

    describe('Faliure', () => {
      it('fails when no tokens are approve ', async () => {
        await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
  
      })
    })
  })

  describe('Depositing Tokens', () => {
    let transaction, result
    let amount = tokens(10)
    

    describe('Success', () => {
        beforeEach(async () => {

          transaction = await token1.connect(user1).approve(exchange.address, amount)
          result = await transaction.wait()
          transaction = await exchange.connect(user1).depositToken(token1.address, amount)
          result = await transaction.wait()

          transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
          result = await transaction.wait()
        })
        it('withdraw tokenfunds', async () => {
            expect(await token1.balanceOf(exchange.address)).to.equal(0)
            expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
            expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
        })

        it('emit a withdraw event', async () => {
          const event = result.events[1]
          expect(event.event).to.equal('Withdraw')

          const args = event.args
          expect(args.token).to.equal(token1.address)
          expect(args.user).to.equal(user1.address)
          expect(args.amount).to.equal(amount)
          expect(args.balance).to.equal(0)
        })
    })

    describe('Faliure', () => {
      it('fails for insufficient balances ', async () => {
        //attempt to withdraw tokens without depositing
        await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted
  
      })
    })
  })

  describe('Checking balances', () => {
    let transaction, result
    let amount = tokens(1)
    
        beforeEach(async () => {
          transaction = await token1.connect(user1).approve(exchange.address, amount)
          result = await transaction.wait()
          transaction = await exchange.connect(user1).depositToken(token1.address, amount)
          result = await transaction.wait()
      })
        it('return user balance', async () => {
            expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
        })
  })  


  describe('Making orders', () => {
    let transaction, result

    let amount = tokens(1)

    describe('Success', async () => {
      beforeEach(async () => {
        //deposit tokens before making order
        transaction = await token1.connect(user1).approve(exchange.address, amount)
        result = await transaction.wait()
        
        transaction = await exchange.connect(user1).depositToken(token1.address, amount)
        result = await transaction.wait()

        transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)
        result = await transaction.wait()
      })

      it('tracks the newly created order', async () => {
          expect(await exchange.orderCount()).to.equal(1)
      })
      
      it('emit an Order event', async () => {
        const event = result.events[0]
        expect(event.event).to.equal('Order')

        const args = event.args
        expect(args.id).to.equal(1)
        expect(args.user).to.equal(user1.address)
        expect(args.tokenGet).to.equal(token2.address)
        expect(args.amountGet).to.equal(tokens(1))
        expect(args.tokenGive).to.equal(token1.address)
        expect(args.amountGive).to.equal(tokens(1))
        expect(args.timestamp).to.at.least(1)
      })
    })
    describe('Faliure', async () => {
      it('Rejects with no balance', async () => {
        await expect(exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))).to.be.rejected
      })
    })
  })       

  describe('Order actions', async () => {

    let transaction, result
    let amount = tokens(1)

    beforeEach('Order actions', async () => {
      transaction = await token1.connect(user1).approve(exchange.address, amount)
      result = await transaction.wait()

      transaction = await exchange.connect(user1).depositToken(token1.address, amount)
      result = await transaction.wait()
     
      //give token to user2
      transaction = await token2.connect(deployer).transfer(user2.address, tokens(100))
      result = await transaction.wait()
      //user2 deposit tokens
      transaction = await token2.connect(user2).approve(exchange.address, tokens(2))
      result = await transaction.wait()

      transaction = await exchange.connect(user2).depositToken(token2.address, tokens(2))
      result = await transaction.wait()

      //make an order
      transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)
      result = await transaction.wait()
      
    })

    describe('Cancelling orders', async () => {

      describe('Success', async () => {
        beforeEach(async () => {
          transaction = await exchange.connect(user1).cancelOrder(1)
          result = await transaction.wait()
        })

        it('updates canceled orders', async () => {
          expect(await exchange.orderCancelled(1)).to.equal(true)
        })

        it('emit an Cancel event', async () => {
          const event = result.events[0]
          expect(event.event).to.equal('Cancel')
  
          const args = event.args
          expect(args.id).to.equal(1)
          expect(args.user).to.equal(user1.address)
          expect(args.tokenGet).to.equal(token2.address)
          expect(args.amountGet).to.equal(tokens(1))
          expect(args.tokenGive).to.equal(token1.address)
          expect(args.amountGive).to.equal(tokens(1))
          expect(args.timestamp).to.at.least(1)
        })
      })

      describe('Failure', async () => {
        // beforeEach(async () => {
        
        // })
        
        it('reject invalid id', async () => {
          const invalidOrderId = 99999
          await expect(exchange.connect(user1).cancelOrder(invalidOrderId)).to.be.reverted
        })

        it('reject unauthorized transaction', async () => {
          await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted
        })
      })
    })

    describe('Filling orders', async () => {

      describe('Success', () => {

        beforeEach(async () => {
          //user2 fills the order
          transaction = await exchange.connect(user2).fillOrder('1')
          result = await transaction.wait()
        })
        
        it('Executes the trade and charge fees', async () => {
          //ensure trade happens
          //check tokenGive balance
          expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(tokens(0))
          expect(await exchange.balanceOf(token1.address, user2.address)).to.equal(tokens(1))
          expect(await exchange.balanceOf(token1.address, feeAccount.address)).to.equal(tokens(0))
          //tokenGet
          expect(await exchange.balanceOf(token2.address, user1.address)).to.equal(tokens(1))
          expect(await exchange.balanceOf(token2.address, user2.address)).to.equal(tokens(0.9))
          expect(await exchange.balanceOf(token2.address, feeAccount.address)).to.equal(tokens(0.1))
        })
  
        it('Updates filled orders', async () => {
          expect(await exchange.orderFilled(1)).to.equal(true)
        })
        
        it('Emit a trade event', async () => {
          const event = result.events[0]
          expect(event.event).to.equal('Trade')
  
          const args = event.args
          expect(args.id).to.equal(1)
          expect(args.user).to.equal(user2.address)
          expect(args.tokenGet).to.equal(token2.address)
          expect(args.amountGet).to.equal(tokens(1))
          expect(args.tokenGive).to.equal(token1.address)
          expect(args.amountGive).to.equal(tokens(1))
          expect(args.creator).to.equal(user1.address)
          expect(args.timestamp).to.at.least(1)
        })


      })

      describe('Failure', () => {
        it('rejects invalid order ids', async () => {
          const invalidOrderId = 99999
          await expect(exchange.connect(user2).fillOrder(invalidOrderId)).to.be.reverted
        })

        it('rejects already filled orders', async () => {
          transaction = await exchange.connect(user2).fillOrder(1)
          await transaction.wait()
          //fill again
          await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
        })

        it('rejects cancelled orders', async () => {
          transaction = await exchange.connect(user1).cancelOrder(1)
          await transaction.wait()

          await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
        })
      })
    })
  })

  
})