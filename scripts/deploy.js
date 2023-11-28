const hre = require("hardhat")

const {
  MIN_DELAY, 
  PROPOSERS, 
  EXECUTORS,
  VOTING_DELAY,
  VOTING_PERIOD,
  PROPOSAL_THRESHOLD,
  QUORUM,
  ZERO_ADDRESS
} = require('../helpers/helper.js'); 


async function deployment() {

  [deployer,,,,,user] = await hre.ethers.getSigners()

  const token = await hre.ethers.getContractFactory("MyToken")
  const tokenInstance = await token.deploy("Governance Token", "GT")
  const tokenAddress = await tokenInstance.getAddress()
  console.log(`Token contract is deployed at ${tokenAddress}`)

  const timelock = await hre.ethers.getContractFactory("TimeLock")
  const timelockInstance = await timelock.deploy(MIN_DELAY, PROPOSERS, EXECUTORS, deployer.address)
  const timelockAddress = await timelockInstance.getAddress()
  console.log(`TimeLock contract is deployed at ${timelockAddress}`)

  const governance = await hre.ethers.getContractFactory("MyGovernor")
  const governanceInstance = await governance.deploy(
    tokenAddress, 
    timelockAddress, 
    VOTING_DELAY,
    VOTING_PERIOD, 
    PROPOSAL_THRESHOLD,
    QUORUM 
  )
  const governanceAddress = await governanceInstance.getAddress()
  console.log(`Governance contract is deployed at ${governanceAddress}`)

  const proposerRoleBytes = await timelockInstance.PROPOSER_ROLE()
  const executorRoleBytes = await timelockInstance.EXECUTOR_ROLE()
  const cancellerRolorBytes = await timelockInstance.CANCELLER_ROLE()
  const adminRoleBytes = await timelockInstance.DEFAULT_ADMIN_ROLE()

  await timelockInstance.grantRole(proposerRoleBytes, governanceAddress)

  await timelockInstance.grantRole(executorRoleBytes, ZERO_ADDRESS)

  

  //await timelockInstance.grantRole(cancellerRolorBytes, deployer.address)

  await timelockInstance.revokeRole(adminRoleBytes, deployer.address)

  const treasury = await hre.ethers.getContractFactory('Treasury')
  const treasuryInstance = await treasury.deploy(user.address, {value: ethers.parseEther("1")}) 
  const treasuryAddress = await treasuryInstance.getAddress()
  console.log(`Treasury contract is deployed at ${treasuryAddress}`)

  await treasuryInstance.transferOwnership(timelockAddress)

  return {
    tokenInstance,
    governanceInstance,
    timelockInstance,
    treasuryInstance,
    user
  };


}

/*We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployment().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});*/

module.exports = {deployment}