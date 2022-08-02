// IMPORTS

// global
import { formatPrefixState } from "../../utils"

// local
import { STAKING_STRINGS } from "./stakingConfig"
import { UserRewardsProgramState } from "./rewardsProgramState"
import Staking from "./staking"

// INTERFACE

export default class UserStakingState {
  totalStaked: number
  scaledTotalStaked: number
  boostMultiplier: number
  userRewardsProgramStates: { [key: number]: UserRewardsProgramState }

  /**
   * Constructor for the user staking state object.
   * 
   * @param userLocalState - user's local state with one staking contract
   * @param staking - staking contract of interest
   */
  constructor(userLocalState: {}, staking: Staking) {
    this.totalStaked = userLocalState[STAKING_STRINGS.user_total_staked] || 0
    this.scaledTotalStaked = userLocalState[STAKING_STRINGS.user_scaled_total_staked] || 0
    this.boostMultiplier = userLocalState[STAKING_STRINGS.boost_multiplier] || 0
    this.userRewardsProgramStates = {}
    const rewardsProgramCount = staking.rewardsProgramCount

    for (let i = 0; i < rewardsProgramCount; ++i) {
      this.userRewardsProgramStates[i] = new UserRewardsProgramState(
        formatPrefixState(userLocalState),
        i,
        staking,
        this.scaledTotalStaked
      )
    }
  }
}
