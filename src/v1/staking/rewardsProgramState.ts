import { bytesToBigInt } from "algosdk"
import { STAKING_STRINGS } from "./stakingConfig"
import Staking from "./staking"

export default class RewardsProgramState {
  rewardsProgramIndex: number
  rewardsProgramCounter: number
  rewardsAssetId: number
  rewardsPerSecond: number
  rewardsCoefficient: bigint
  rewardsIssued: number
  rewardsPayed: number

  // pass in formatted staking state and extract based on index
  /**
   * Constructor for rewards program state
   * 
   * @param stakingState - formatted staking state
   * @param rewardsProgramIndex - index of rewards program 
   */
  constructor(stakingState: {}, rewardsProgramIndex: number) {
    this.rewardsProgramIndex = rewardsProgramIndex
    this.rewardsProgramCounter =
      stakingState[STAKING_STRINGS.rewards_program_counter_prefix + this.rewardsProgramIndex.toString()] || 0
    this.rewardsAssetId =
      stakingState[STAKING_STRINGS.rewards_asset_id_prefix + this.rewardsProgramIndex.toString()] || 0
    this.rewardsPerSecond =
      stakingState[STAKING_STRINGS.rewards_per_second_prefix + this.rewardsProgramIndex.toString()] || 0
    this.rewardsIssued = stakingState[STAKING_STRINGS.rewards_issued_prefix + this.rewardsProgramIndex.toString()] || 0
    this.rewardsPayed = stakingState[STAKING_STRINGS.rewards_payed_prefix + this.rewardsProgramIndex.toString()] || 0

    const nonFormattedRewardsCoefficient =
      stakingState[STAKING_STRINGS.rewards_coefficient_prefix + this.rewardsProgramIndex.toString()] || 0
    if (nonFormattedRewardsCoefficient === 0) {
      this.rewardsCoefficient = BigInt(0)
    } else {
      const bytesVer = new Uint8Array(Buffer.from(nonFormattedRewardsCoefficient, "base64"))
      const bigInt = bytesToBigInt(bytesVer)
      this.rewardsCoefficient = bigInt
    }
  }
}

export class UserRewardsProgramState {
  rewardsProgramIndex: number
  userRewardsProgramCounter: number
  userRewardsCoefficient: bigint
  userUnclaimedRewards: number
  userUnrealizedRewards: number

  /**
   * Constructor for UserRewardsProgramState
   * 
   * @param formattedUserLocalState - local state for the user
   * @param rewardsProgramIndex - index of the rewards program
   * @param staking - staking
   * @param userScaledTotalStaked - scaled user total staked
   */
  constructor(
    formattedUserLocalState: {},
    rewardsProgramIndex: number,
    staking: Staking,
    userScaledTotalStaked: number
  ) {
    this.rewardsProgramIndex = rewardsProgramIndex
    this.userRewardsProgramCounter =
      formattedUserLocalState[
        STAKING_STRINGS.user_rewards_program_counter_prefix + this.rewardsProgramIndex.toString()
      ] || 0
    this.userUnclaimedRewards =
      formattedUserLocalState[STAKING_STRINGS.user_unclaimed_rewards_prefix + this.rewardsProgramIndex.toString()] || 0

    const nonFormattedRewardsCoefficient =
      formattedUserLocalState[STAKING_STRINGS.user_rewards_coefficient_prefix + this.rewardsProgramIndex.toString()] || 0

    if (nonFormattedRewardsCoefficient === 0) {
      this.userRewardsCoefficient = BigInt(0)
    } else {
      const bytesVer = new Uint8Array(Buffer.from(nonFormattedRewardsCoefficient, "base64"))
      const bigInt = bytesToBigInt(bytesVer)
      this.userRewardsCoefficient = bigInt
    }

    // calc user unrealized rewards (global coefficient on rewards program - user rewards coefficient on rewards program) * userTotalScaledStaked
    const globalCoefficient = staking.rewardsProgramStates[this.rewardsProgramIndex].rewardsCoefficient
    const userCoefficient = this.userRewardsCoefficient

    this.userUnrealizedRewards = Number(
      (globalCoefficient - userCoefficient) * BigInt(userScaledTotalStaked) + BigInt(this.userUnclaimedRewards)
    )
  }
}
