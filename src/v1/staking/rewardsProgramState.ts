import { STAKING_STRINGS } from "./stakingConfig"
import Staking from "./staking"

export default class RewardsProgramState{
	rewardsProgramIndex: number
	rewardsProgramCounter: number
	rewardsAssetId: number
	rewardsPerSecond: number
	rewardsCoefficient: number
	rewardsIssued: number
	rewardsPayed: number

	// pass in formatted staking state and extract based on index
	constructor(stakingState: {}, rewardsProgramIndex: number) {
		this.rewardsProgramIndex = rewardsProgramIndex
		this.rewardsProgramCounter = stakingState[STAKING_STRINGS.rewards_program_counter_prefix + this.rewardsProgramIndex.toString()] || 0
		this.rewardsAssetId = stakingState[STAKING_STRINGS.rewards_asset_id_prefix + this.rewardsProgramIndex.toString()] || 0
		this.rewardsPerSecond = stakingState[STAKING_STRINGS.rewards_per_second_prefix + this.rewardsProgramIndex.toString()] || 0
		this.rewardsCoefficient = stakingState[STAKING_STRINGS.rewards_coefficient_prefix + this.rewardsProgramIndex.toString()] || 0

		this.rewardsIssued = stakingState[STAKING_STRINGS.rewards_issued_prefix + this.rewardsProgramIndex.toString()] || 0
		this.rewardsPayed = stakingState[STAKING_STRINGS.rewards_payed_prefix + this.rewardsProgramIndex.toString()] || 0
	}
}

export class UserRewardsProgramState{

	rewardsProgramIndex: number
	userRewardsProgramCounter: number
	userRewardsCoefficient: number
	userUnclaimedRewards: number
	userUnrealizedRewards: number

	constructor(formattedUserLocalState: {}, rewardsProgramIndex: number, staking: Staking, userScaledTotalStaked: number) {
		this.rewardsProgramIndex = rewardsProgramIndex
		this.userRewardsProgramCounter = formattedUserLocalState[STAKING_STRINGS.user_rewards_program_counter_prefix + this.rewardsProgramIndex.toString()] || 0
		this.userRewardsCoefficient = formattedUserLocalState[STAKING_STRINGS.user_rewards_coefficient_prefix + this.rewardsProgramIndex.toString()] || 0
		this.userUnclaimedRewards = formattedUserLocalState[STAKING_STRINGS.user_unclaimed_rewards_prefix + this.rewardsProgramIndex.toString()] || 0

		// calc user unrealized rewards (global coefficient on rewards program - user rewards coefficient on rewards program) * userTotalScaledStaked
		const globalCoefficient = staking.rewardsProgramStates[this.rewardsProgramIndex].rewardsCoefficient
		const userCoefficient = this.userRewardsCoefficient
		this.userUnrealizedRewards = (globalCoefficient - userCoefficient) * userScaledTotalStaked
	}
}
