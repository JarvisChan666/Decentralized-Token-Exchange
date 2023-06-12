// import { ethers } from "hardhat";

// async function deployToken() {
//   const Token = (await ethers.getContractFactory(
//      "Token"  
//   )) as ethers.ContractFactory;

//   const token = await Token.deploy();  
//   await token.deployed();

//   console.log(`Token deployed to ${token.address}`)
// }  

// deployToken().catch(error => {
//   console.error(error);   
//   process.exitCode = 1; 
// });