// IMPORTS
import { Network } from "../../globals"

// INTERFACE

export default class StakingConfig {
  public name: string
  public managerAppId: number
  public marketAppId: number
  public assetId: number
  public oracleAppId: number

  /**
   * Constructor for the v1 staking config.
   * 
   * @param name - name
   * @param managerAppId - manager app id
   * @param marketAppId - market app id
   * @param assetId - asset id
   * @param oracleAppId - oracle app id
   */
  constructor(
    name: string,
    managerAppId: number,
    marketAppId: number,
    assetId: number,
    oracleAppId: number
  ) {
    this.name = name
    this.managerAppId = managerAppId
    this.marketAppId = marketAppId
    this.assetId = assetId
    this.oracleAppId = oracleAppId
  }
}

export const StakingConfigs = {
  [Network.MAINNET]: [
    // Staking
    new StakingConfig("STBL Staking", 482625868, 482608867, 465865291, 451327550),
    new StakingConfig("DEFLY Staking", 641500474, 641499935, 470842789, 451327550),
    new StakingConfig("OPUL Staking", 674527132, 674526408, 287867876, 451327550),
    // Tinyman Farming
    new StakingConfig("Tinyman v1 STBL-USDC LP Staking", 485247444, 485244022, 467020179, 451327550),
    new StakingConfig("Tinyman v1.1 STBL-USDC LP Staking", 553869413, 553866305, 552737686, 451327550),
    // Algofi Farming
    new StakingConfig("Algofi STBL-ALGO LP Staking", 611804624, 611801333, 607645566, 451327550),
    new StakingConfig("Algofi STBL-USDC LP Staking", 611869320, 611867642, 609172718, 451327550),
    new StakingConfig("Algofi STBL-USDC Nano LP Staking", 661193019, 661192413, 658337286, 451327550),
    new StakingConfig("Algofi USDC-USDT Nano LP Staking", 661247364, 661207804, 659678778, 451327550),
    new StakingConfig("Algofi STBL-USDT Nano LP Staking", 661204747, 661199805, 659677515, 451327550),
    new StakingConfig("Algofi STBL-XET LP Staking", 635813909, 635812850, 635256863, 451327550),
    new StakingConfig("Algofi STBL-ZONE LP Staking", 647785804, 647785158, 647801343, 451327550),
    new StakingConfig("Algofi STBL-DEFLY LP Staking", 639747739, 639747119, 624956449, 451327550),
    new StakingConfig("Algofi STBL-goBTC LP Staking", 635863793, 635860537, 635846733, 451327550),
    new StakingConfig("Algofi STBL-goETH LP Staking", 635866213, 635864509, 635854339, 451327550),
    new StakingConfig("Algofi STBL-OPUL LP Staking", 637795072, 637793356, 637802380, 451327550),
  ],
  [Network.MAINNET_CLONE3]: [
    // Staking
    new StakingConfig("STBL Staking", 482625868, 482608867, 465865291, 451327550),
    new StakingConfig("DEFLY Staking", 641500474, 641499935, 470842789, 451327550),
    new StakingConfig("OPUL Staking", 674527132, 674526408, 287867876, 451327550),
    // Tinyman Farming
    new StakingConfig("Tinyman v1 STBL-USDC LP Staking", 485247444, 485244022, 467020179, 451327550),
    new StakingConfig("Tinyman v1.1 STBL-USDC LP Staking", 553869413, 553866305, 552737686, 451327550),
    // Algofi Farming
    new StakingConfig("Algofi STBL-ALGO LP Staking", 611804624, 611801333, 607645566, 451327550),
    new StakingConfig("Algofi STBL-USDC LP Staking", 611869320, 611867642, 609172718, 451327550),
    new StakingConfig("Algofi STBL-USDC Nano LP Staking", 661193019, 661192413, 658337286, 451327550),
    new StakingConfig("Algofi USDC-USDT Nano LP Staking", 661247364, 661207804, 659678778, 451327550),
    new StakingConfig("Algofi STBL-USDT Nano LP Staking", 661204747, 661199805, 659677515, 451327550),
    new StakingConfig("Algofi STBL-XET LP Staking", 635813909, 635812850, 635256863, 451327550),
    new StakingConfig("Algofi STBL-ZONE LP Staking", 647785804, 647785158, 647801343, 451327550),
    new StakingConfig("Algofi STBL-DEFLY LP Staking", 639747739, 639747119, 624956449, 451327550),
    new StakingConfig("Algofi STBL-goBTC LP Staking", 635863793, 635860537, 635846733, 451327550),
    new StakingConfig("Algofi STBL-goETH LP Staking", 635866213, 635864509, 635854339, 451327550),
    new StakingConfig("Algofi STBL-OPUL LP Staking", 637795072, 637793356, 637802380, 451327550),
  ],
}

export const STAKING_STRINGS = {
  rewards_program_number: "nrp",
  
  user_storage_address: "usa",
  total_staked: "acc",
  user_total_staked: "uac",
  rewards_amount: "ra",
  rewards_asset_id: "rai",
  rewards_per_second: "rp",
  rewards_secondary_asset_id: "rsai",
  rewards_secondary_ratio: "rsr",
  user_pending_rewards: "upr",
  user_secondary_pending_rewards: "us",
  user_rewards_program_number: "urpn",
  
  rewards_coefficient: "\x00\x00\x00\x00\x00\x00\x00\x01_ci",
  user_rewards_coefficient: "\x00\x00\x00\x00\x00\x00\x00\x01_uc",

  fetch_market_variables: "fmv",
  dummy: "d",

  oracle_app_id: "o",

  update_prices: "up",
  
  update_protocol_data: "upd",
  update_rewards_program: "urp",


  stake: "mt",
  unstake: "rcu",
  claim_rewards: "cr"

}
