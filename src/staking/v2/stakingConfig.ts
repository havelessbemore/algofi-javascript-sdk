// IMPORTS

// global
import { Network } from "../../globals"

// INTERFACE

export enum StakingType {
  V1 = 0,
  V2 = 1,
  BASSET = 2
}

export default class StakingConfig {
  public name: string
  public appId: number
  public assetId: number
  public type: StakingType

  /**
   * Constructor for staking config.
   * 
   * @param appId - staking app id
   * @param assetId - staking asset id
   * @param type - type
   */
  constructor(name: string, appId: number, assetId: number, type: StakingType) {
    this.name = name
    this.appId = appId
    this.assetId = assetId
    this.type = type
  }
}

export const StakingConfigs = {
  [Network.MAINNET]: [
    new StakingConfig("Algo Lend and Earn", 818206045, 818179690, StakingType.BASSET),
    new StakingConfig("USDC Lend and Earn", 818207598, 818182311, StakingType.BASSET),
    new StakingConfig("goBTC Lend and Earn", 818207650, 818184214, StakingType.BASSET),
    new StakingConfig("goETH Lend and Earn", 818207743, 818188553, StakingType.BASSET),
    new StakingConfig("USDT Lend and Earn", 818207873, 818190568, StakingType.BASSET),
  ],
  [Network.MAINNET_CLONE3]: [
    new StakingConfig("Test Staking 1", 805980186, 802871797, StakingType.V2),
    new StakingConfig("Test Staking 2", 805982398, 802872834, StakingType.V2),
    new StakingConfig("Test Staking 3", 807135066, 802887476, StakingType.BASSET)
  ],
}

export const rewardsManagerAppId = {
  [Network.MAINNET]: 0,
  [Network.MAINNET_CLONE3]: 805940592,
}

export const STAKING_STRINGS = {
  admin: "a",
  rewards_program_count: "rpc",
  rps_pusher: "rpsp",
  contract_update_delay: "cud",
  contract_update_time: "cut",
  boost_multiplier_app_id: "bmai",
  rewards_manager_app_id: "rmai",
  external_boost_multiplier: "ebm",
  asset_id: "ai",
  user_total_staked: "uts",
  user_scaled_total_staked: "usts",
  boost_multiplier: "bm",
  user_rewards_program_counter_prefix: "urpc_",
  user_rewards_coefficient_prefix: "urc_",
  user_unclaimed_rewards_prefix: "uur_",
  total_staked: "ts",
  scaled_total_staked: "sts",
  latest_time: "lt",
  rewards_escrow_account: "rea",
  rewards_program_counter_prefix: "rpc_",
  rewards_asset_id_prefix: "rai_",
  rewards_per_second_prefix: "rps_",
  rewards_coefficient_prefix: "rc_",
  rewards_issued_prefix: "ri_",
  rewards_payed_prefix: "rp_",
  schedule_contract_update: "scu",
  increase_contract_update_delay: "icud",
  set_rewards_manager_app_id: "srma",
  set_boost_app_id: "sbai",
  set_rewards_program: "srp",
  update_rewards_program: "urp",
  opt_into_asset: "oia",
  opt_into_rewards_manager: "oirm",
  update_rewards_per_second: "urps",
  farm_ops: "fo",
  stake: "s",
  unstake: "u",
  claim_rewards: "cr",
  update_target_user: "utu",
  update_vebank_data: "update_vebank_data"
}
