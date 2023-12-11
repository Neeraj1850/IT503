const { ethers } = require("hardhat");
const { hashMessage } = require("@ethersproject/hash");
const { expect, equal } = require("chai");
const { deployment } = require("../scripts/deploy.js");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

describe("Test cases", () => {
	let tokenInstance, governanceInstance, timelockInstance, treasuryInstance;
	let admin, voter1, voter2, voter3, voter4, user;
	let id;

	before(async () => {
		({
			tokenInstance,
			governanceInstance,
			timelockInstance,
			treasuryInstance,
			user,
		} = await deployment());
		[admin, voter1, voter2, voter3, voter4] = await ethers.getSigners();
	});

	it("assigns token weightage to tiers", async () => {
		await tokenInstance.assignTierDetails(0, ethers.parseEther("100"));
		await tokenInstance.assignTierDetails(1, ethers.parseEther("200"));
		await tokenInstance.assignTierDetails(2, ethers.parseEther("300"));

		expect((await tokenInstance.tierDetails(0)).tokenWeightage).to.equal(
			ethers.parseEther("100")
		);
		expect((await tokenInstance.tierDetails(1)).tokenWeightage).to.equal(
			ethers.parseEther("200")
		);
		expect((await tokenInstance.tierDetails(2)).tokenWeightage).to.equal(
			ethers.parseEther("300")
		);
	});

	it("assigns tiers to employees", async () => {
		await tokenInstance.assignTier(voter1.address, 0);
		await tokenInstance.assignTier(voter2.address, 1);
		await tokenInstance.assignTier(voter3.address, 2);
		await tokenInstance.assignTier(voter4.address, 2);

		expect(await tokenInstance.employeeTier(voter1.address)).to.equal(0);
		expect(await tokenInstance.employeeTier(voter2.address)).to.equal(1);
		expect(await tokenInstance.employeeTier(voter3.address)).to.equal(2);
		expect(await tokenInstance.employeeTier(voter4.address)).to.equal(2);
	});

	it("mints tokens to voters", async () => {
		await tokenInstance.batchMint([
			voter1.address,
			voter2.address,
			voter3.address,
			voter4.address,
		]);

		expect(await tokenInstance.balanceOf(voter1.address)).to.equal(
			ethers.parseEther("100")
		);
		expect(await tokenInstance.balanceOf(voter2.address)).to.equal(
			ethers.parseEther("200")
		);
		expect(await tokenInstance.balanceOf(voter3.address)).to.equal(
			ethers.parseEther("300")
		);
		expect(await tokenInstance.balanceOf(voter4.address)).to.equal(
			ethers.parseEther("300")
		);
	});

	it("delegates user votes to themselves", async () => {
		await tokenInstance.connect(voter1).delegate(voter1.address);
		await tokenInstance.connect(voter2).delegate(voter2.address);
		await tokenInstance.connect(voter3).delegate(voter3.address);
		await tokenInstance.connect(voter4).delegate(voter4.address);

		expect(await tokenInstance.getVotes(voter1.address)).to.equal(
			ethers.parseEther("100")
		);
		expect(await tokenInstance.getVotes(voter2.address)).to.equal(
			ethers.parseEther("200")
		);
		expect(await tokenInstance.getVotes(voter3.address)).to.equal(
			ethers.parseEther("300")
		);
		expect(await tokenInstance.getVotes(voter4.address)).to.equal(
			ethers.parseEther("300")
		);
	});

	describe("failure voting", async () => {
		it("create a proposal", async () => {
			const encodedFunction =
				await treasuryInstance.interface.encodeFunctionData("releaseFunds");
			const treasuryAddress = treasuryInstance.getAddress();
			const tx = await governanceInstance.propose(
				[treasuryAddress],
				[0],
				[encodedFunction],
				"Release Funds"
			);

			const txReceipt = await tx.wait();
			id = txReceipt.logs[0].args.proposalId;

			expect(await governanceInstance.proposalProposer(id)).to.equal(
				admin.address
			);
		});

		it("checks proposal details", async () => {
			const state = await governanceInstance.state(id); //state of current proposal
			const snapshot = await governanceInstance.proposalSnapshot(id); //proposal created on block
			const deadline = await governanceInstance.proposalDeadline(id); //proposal end time
			const blocknumber = await ethers.provider.getBlockNumber();
			const quorum = await governanceInstance.quorum(
				Number(blocknumber) - Number(1)
			); //number of votes required to execute
		});

		it("checks voting", async () => {
			await mine(1);
			await governanceInstance.connect(voter1).castVote(id, 0);
			await governanceInstance.connect(voter2).castVote(id, 0);
			await governanceInstance.connect(voter3).castVote(id, 0);
			await governanceInstance.connect(voter4).castVote(id, 0);
		});

		it("checks execution", async () => {
			const state0 = await governanceInstance.state(id);
			console.log(`Current state of Proposal ${state0}`);
			await mine(10);

			const state1 = await governanceInstance.state(id);
			console.log(`Current state of Proposal ${state1}`);

			const hash =
				"0x45d617489b5ab66eacf6882678329a52c9ecfa41346734b56fe076532134b821";
			const treasuryAddress = await treasuryInstance.getAddress();
			const encodedFunction =
				await treasuryInstance.interface.encodeFunctionData("releaseFunds");

			const state2 = await governanceInstance.state(id);
			console.log(`Current state of Proposal ${state2}`);
			//await mine(10)

			/*await governanceInstance.execute([treasuryAddress],[0],[encodedFunction],hash)
      const state3 = await governanceInstance.state(id)
      
      console.log(`Current state of Proposal ${state3}`)*/

			// 0:Pending, 1:Active, 2:Canceled, 3:Defeated, 4:Succeeded, 5:Queued, 6:Expired, 7:Executed
		});
	});
});
