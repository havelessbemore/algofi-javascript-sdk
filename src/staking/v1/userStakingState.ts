// IMPORTS

// external
import algosdk, { Algodv2 } from "algosdk"

// global
import { getLocalStates } from "../../stateUtils"
import { formatPrefixState } from "../../utils"

// local
import { STAKING_STRINGS } from "./stakingConfig"
import Staking from "./staking"

// INTERFACE

export default class UserStakingState {
  public algod: Algodv2
  public staking: Staking
  public storageAddress: string
  
  public totalStaked: number
  public rewardsProgramNumber: number
  public rewardsCoefficient: number

  public unclaimedRewards: number
  public unclaimedSecondaryRewards: number
  public rewardsPerYear: number
  public secondaryRewardsPerYear: number

  /**
   * Constructor for the v1 user staking state object.
   * 
   * @param algod - algod client
   * @param staking - staking 
   * @param storageAddress - storage address
   */
  constructor(algod: Algodv2, staking: Staking, storageAddress: string) {
    this.algod = algod
    this.staking = staking
    this.storageAddress = storageAddress
  }
  
  /**
   * Function to get the local states of the staking contract and update the
   * information in the object.
   */
  async loadState() {
    let storageLocalStates = await getLocalStates(this.algod, this.storageAddress)

    this.totalStaked = storageLocalStates[this.staking.marketAppId][STAKING_STRINGS.user_total_staked] || 0
    this.rewardsProgramNumber = storageLocalStates[this.staking.managerAppId][STAKING_STRINGS.user_rewards_program_number] || 0
    this.rewardsCoefficient = storageLocalStates[this.staking.managerAppId][STAKING_STRINGS.user_rewards_coefficient] || 0
    
    let pendingRewards = storageLocalStates[this.staking.managerAppId][STAKING_STRINGS.user_pending_rewards] || 0
    let pendingSecondaryRewards = storageLocalStates[this.staking.managerAppId][STAKING_STRINGS.user_secondary_pending_rewards] || 0
    
    let unrealizedRewards = 0
    if (this.rewardsProgramNumber == this.staking.rewardsProgramNumber) {
      unrealizedRewards = (this.staking.rewardsCoefficient - this.rewardsCoefficient) * this.totalStaked / (10**14)
    } else {
      unrealizedRewards = (this.staking.rewardsCoefficient) * this.totalStaked / (10**14)
    }
    let unrealizedSecondaryRewards = unrealizedRewards * this.staking.rewardsSecondaryRatio / (10**3)
  
    this.unclaimedRewards = pendingRewards + unrealizedRewards
    this.unclaimedSecondaryRewards = pendingSecondaryRewards + unrealizedSecondaryRewards
    
    if (this.totalStaked > 0) { 
      this.rewardsPerYear = this.staking.rewardsPerSecond * (365 * 24 * 60 * 60) * this.totalStaked / this.staking.totalStaked
    } else {
      this.rewardsPerYear = 0
    }
    this.secondaryRewardsPerYear = this.rewardsPerYear * this.staking.rewardsSecondaryRatio / (10**3)
  }
}

