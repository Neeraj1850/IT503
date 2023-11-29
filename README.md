# DAO-ENABLED DECISION MAKING IN ENTERPRISES

## Overview

This project implements a governance system using smart contracts. It includes a custom ERC20 token with tier-based voting power, a timelock mechanism for secure transaction execution, a governor contract for proposal management, and a treasury contract for fund storage and management.

### Contracts

1. **Token Contract (MyToken.sol)**
   - An ERC20 token with voting capabilities (ERC20Votes).
   - Implements tier levels representing the amount of tokens a voter receives based on their tier.
   - Admin can allocate different token amounts to each tier.

2. **Timelock Contract (TimeLock.sol)**
   - A timelock controller to delay the execution of transactions.
   - Manages roles for different users/admins, determining who can propose and execute transactions.

3. **Governor Contract (Governance.sol)**
   - Manages the proposal process for the governance system.
   - Tracks the state of proposals and handles voting mechanics.

4. **Treasury Contract (Treasury.sol)**
   - Stores and manages funds for the governance system.
   - Owned by the Timelock contract to ensure secure fund management.

### Deployment and Testing

- **Deployment Script (deploy.js)**
  - Deploys all contracts and sets up the initial configuration.
  - Assigns roles in the Timelock contract and transfers ownership of the Treasury contract to the Timelock contract.

- **Testing Script (test.js)**
  - Contains test cases for token tier assignments, token minting, proposal creation, voting, and execution.
  - Verifies the correct state transitions of proposals and the release of funds from the treasury.

### Flow Diagram

![Flow Diagram](https://github.com/Neeraj1850/IT503/blob/master/helpers/1.png)

### Getting Started

To deploy and test the contracts:

1. Install dependencies:
   ```bash
   npm install
   
2. Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy.js

3. Execute the test cases:
  ```bash
  npx hardhat test


