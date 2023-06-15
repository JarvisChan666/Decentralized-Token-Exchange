const { expect } = require('chai');
const { ethers } = require('hardhat');
const { connect } = require('react-redux');
const { composeWithDevTools } = require('redux-devtools-extension');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Exchange', () => {
  let deployer, feeAccount, exchange

    const feePercent = 10

  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory('Exchange')
    const Token = await ethers.getContractFactory('Token')
    
    token1 = await Token.deploy('Dapp University', 'DApp')
    
    
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    feeAccount = accounts[1]
    user1 = accounts[2]
    
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
    let amount = tokens(10)
    beforeEach(async () => {
        transaction = await exchange,connect(user1).depositToken(token1.address, amount)
      })

    describe('Success', () => {

    })

    describe('Faliure', () => {

    })
  })
})
