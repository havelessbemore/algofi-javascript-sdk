// IMPORTS 

// local
import { STAKING_STRINGS } from "./stakingConfig"
import { UserRewardsProgramState } from "./rewardsProgramState"
import Staking from "./staking"
import { formatPrefixState } from "./../utils"

// INTERFACE

export default class UserStakingState {
	totalStaked: number
	scaledTotalStaked: number
	boostMultiplier: number
	userRewardsProgramStates: { [key: number]:  UserRewardsProgramState }
  constructor(userLocalState: {}, staking: Staking) {
		this.totalStaked = userLocalState[STAKING_STRINGS.user_total_staked] || 0
		this.scaledTotalStaked = userLocalState[STAKING_STRINGS.scaled_total_staked] || 0
		this.boostMultiplier = userLocalState[STAKING_STRINGS.boost_multiplier] || 0
		this.userRewardsProgramStates = {}
		const rewardsProgramCount = staking.rewardsProgramCount

		for (let i = 0; i < rewardsProgramCount; ++i) {
			this.userRewardsProgramStates[i] = new UserRewardsProgramState(formatPrefixState(userLocalState), i, staking, this.scaledTotalStaked)
		}
  }
}
