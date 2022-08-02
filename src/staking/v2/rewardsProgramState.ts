// IMPORTS

// external
import { bytesToBigInt } from "algosdk"

// global
import {
  FIXED_18_SCALE_FACTOR,
  SECONDS_PER_YEAR
} from "../../globals"

// local
import { STAKING_STRINGS } from "./stakingConfig"
import Staking from "./staking"

export default class RewardsProgramState {
  staking: Staking
  rewardsProgramIndex: number
  rewardsProgramCounter: number
  rewardsAssetId: number
  rewardsPerSecond: number
  rewardsCoefficient: bigint
  rewardsIssued: number
  rewardsPayed: number

  projectedRewardsCoefficient: bigint

  /**
   * Constructor for rewards program state
   * 
   * @param stakingState - formatted staking state
   * @param rewardsProgramIndex - index of rewards program 
   */
  constructor(staking, stakingState: {}, rewardsProgramIndex: number) {
    this.staking = staking
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

    this.projectedRewardsCoefficient = this.rewardsCoefficient +
      BigInt((Math.floor(Date.now() / 1000) - staking.latestTime) * this.rewardsPerSecond) * FIXED_18_SCALE_FACTOR / BigInt(staking.scaledTotalStaked)
  }

  getAPR(): number {
    let rewardsPerYear = this.staking.assetDataClient.getAsset(this.rewardsPerSecond * SECONDS_PER_YEAR, this.rewardsAssetId)
    return rewardsPerYear.toUSD() / (this.staking.getTotalStaked().toUSD() || 1)
  }
}

export class UserRewardsProgramState {
  staking: Staking
  rewardsProgramIndex: number
  userRewardsProgramCounter: number
  userRewardsCoefficient: bigint
  userUnclaimedRewards: number
  userUnrealizedRewards: number

  /**
   * Constructor for user rewards program state object
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
    this.staking = staking
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
    const globalCoefficient = staking.rewardsProgramStates[this.rewardsProgramIndex].projectedRewardsCoefficient
    const userCoefficient = this.userRewardsCoefficient

    this.userUnrealizedRewards = Number(
      (globalCoefficient - userCoefficient) * BigInt(userScaledTotalStaked) + BigInt(this.userUnclaimedRewards)
    )
  }
}
