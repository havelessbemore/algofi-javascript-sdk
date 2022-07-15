// IMPORTS

// external
import algosdk, { Algodv2 } from "algosdk"

// global
import { getLocalStates } from "./../stateUtils"

// local
import { V1_STAKING_STRINGS } from "./v1_stakingConfig"
import V1Staking from "./v1_staking"
import { formatPrefixState } from "./../utils"

// INTERFACE

export default class V1UserStakingState {
  public algod: Algodv2
  public staking: V1Staking
  public storageAddress: string
  
  public totalStaked: number
  public rewardsProgramNumber: number
  public rewardsCoefficient: number

  public unclaimedRewards: number
  public unclaimedSecondaryRewards: number
  public rewardsPerYear: number
  public secondaryRewardsPerYear: number

  constructor(algod: Algodv2, staking: V1Staking, storageAddress: string) {
    this.algod = algod
    this.staking = staking
    this.storageAddress = storageAddress
  }
  
  async loadState() {
    let storageLocalStates = await getLocalStates(this.algod, this.storageAddress)

    this.totalStaked = storageLocalStates[this.staking.marketAppId][V1_STAKING_STRINGS.user_total_staked]
    this.rewardsProgramNumber = storageLocalStates[this.staking.managerAppId][V1_STAKING_STRINGS.user_rewards_program_number]
    this.rewardsCoefficient = storageLocalStates[this.staking.managerAppId][V1_STAKING_STRINGS.user_rewards_coefficient]
    
    let pendingRewards = storageLocalStates[this.staking.managerAppId][V1_STAKING_STRINGS.user_pending_rewards]
    let pendingSecondaryRewards = storageLocalStates[this.staking.managerAppId][V1_STAKING_STRINGS.user_secondary_pending_rewards]
    
    let unrealizedRewards = 0
    if (this.rewardsProgramNumber == this.staking.rewardsProgramNumber) {
      unrealizedRewards = (this.staking.rewardsCoefficient - this.rewardsCoefficient) * this.totalStaked / (10**12)
    } else {
      unrealizedRewards = (this.staking.rewardsCoefficient) * this.totalStaked / (10**12)
    }
    let unrealizedSecondaryRewards = unrealizedRewards * this.staking.rewardsSecondaryRatio / (10**3)
  
    this.unclaimedRewards = pendingRewards + unrealizedRewards
    this.unclaimedSecondaryRewards = pendingSecondaryRewards + unrealizedSecondaryRewards
    
    this.rewardsPerYear = this.staking.rewardsPerSecond * (365 * 24 * 60 * 60) * this.totalStaked / this.staking.totalStaked
    this.secondaryRewardsPerYear = this.rewardsPerYear * this.staking.rewardsSecondaryRatio / (10**3)
  }
}

