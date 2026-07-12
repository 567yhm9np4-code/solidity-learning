import hre from "hardhat";
import { expect } from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { MyToken, TinyBank } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TinyBank", () => {
  let signers: HardhatEthersSigner[];
  let myTokenC: MyToken;
  let tinyBankC: TinyBank;
  beforeEach(async () => {
    signers = await hre.ethers.getSigners();
    myTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      DECIMALS,
      MINTING_AMOUNT,
    ]);

    const managers = [
      signers[0].address,
      signers[1].address,
      signers[2].address,
      signers[3].address,
      signers[4].address,
    ];

    tinyBankC = await hre.ethers.deployContract("TinyBank", [
      await myTokenC.getAddress(),
      managers,
    ]);

    await myTokenC.setManager(tinyBankC.getAddress());
  });

  describe("initialized state check", () => {
    it("should return totalStaked 0", async () => {
      expect(await tinyBankC.totalStaked()).to.equal(0);
    });
    it("should return staked 0 amount of signer 0", async () => {
      const signer0 = signers[0];
      expect(await tinyBankC.staked(signer0.address)).to.equal(0);
    });
  });

  describe("Staking", async () => {
    it("should return staked amount", async () => {
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
      await expect(tinyBankC.stake(stakingAmount))
        .to.emit(tinyBankC, "Staked")
        .withArgs(signer0.address, stakingAmount);
      expect(await tinyBankC.staked(signer0.address)).equal(stakingAmount);
      expect(await tinyBankC.totalStaked()).equal(stakingAmount);
      expect(await myTokenC.balanceOf(tinyBankC)).equal(
        await tinyBankC.totalStaked(),
      );
    });
  });

  describe("withdraw", () => {
    it("should return 0 staked after withdrawing total token", async () => {
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
      await tinyBankC.stake(stakingAmount);
      await expect(tinyBankC.withdraw(stakingAmount))
        .to.emit(tinyBankC, "withdraw")
        .withArgs(stakingAmount, signer0.address);
      expect(await tinyBankC.staked(signer0.address)).equal(0);
    });
  });

  describe("reward", () => {
    it("should reward 1MT every blocks", async () => {
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
      await tinyBankC.stake(stakingAmount);

      const BLOCKS = 5n;
      const transferAmount = hre.ethers.parseUnits("1", DECIMALS);
      for (var i = 0; i < BLOCKS; i++) {
        await myTokenC.transfer(transferAmount, signer0.address);
      }

      await tinyBankC.withdraw(stakingAmount);
      expect(await myTokenC.balanceOf(signer0.address)).equal(
        hre.ethers.parseUnits((BLOCKS + MINTING_AMOUNT + 1n).toString()),
      );
    });

    it("should revert when non-manager confirms", async () => {
      const nonManager = signers[5];

      await expect(tinyBankC.connect(nonManager).confirm()).to.be.revertedWith(
        "You are not a manager",
      );
    });

    it("should revert when not all managers confirmed", async () => {
      const amount = hre.ethers.parseUnits("10", DECIMALS);

      await tinyBankC.connect(signers[0]).confirm();
      await tinyBankC.connect(signers[1]).confirm();

      await expect(tinyBankC.setRewardPerBlock(amount)).to.be.revertedWith(
        "Not all confirmed yet",
      );
    });

    it("should change rewardPerBlock when all managers confirmed", async () => {
      const amount = hre.ethers.parseUnits("10", DECIMALS);

      await tinyBankC.connect(signers[0]).confirm();
      await tinyBankC.connect(signers[1]).confirm();
      await tinyBankC.connect(signers[2]).confirm();
      await tinyBankC.connect(signers[3]).confirm();
      await tinyBankC.connect(signers[4]).confirm();

      await expect(tinyBankC.setRewardPerBlock(amount)).to.not.be.reverted;
    });
  });
});
