// IMPORTS

// global
import { Network } from "../globals"

// INTERFACE

export default class LendingPoolConfig {
  public appId: number
  public market1AppId: number
  public market2AppId: number
  public lpMarketAppId: number
  public poolAppId: number
  public opFarmAppId: number

  constructor(
    appId: number,
    market1AppId: number,
    market2AppId: number,
    lpMarketAppId: number,
    poolAppId: number,
    opFarmAppId: number
  ) {
    this.appId = appId
    this.market1AppId = market1AppId
    this.market2AppId = market2AppId
    this.lpMarketAppId = lpMarketAppId
    this.poolAppId = poolAppId
    this.opFarmAppId = opFarmAppId
  }
}

export const LendingPoolConfigs = {
  [Network.MAINNET]: [
    new LendingPoolConfig(1, 2, 3, 4, 5, 6), // bUSDC / bSTBL2
  ],
  [Network.TESTNET]: [
    new LendingPoolConfig(104240801, 104207076, 104213311, 104238373, 104228342, 104240608), // bUSDC / bSTBL2
  ],
}

// STRING CONTSTANTS

export const LENDING_POOL_INTERFACE_STRINGS = {
  market1_app_id: "market1_app_id",
  market2_app_id: "market2_app_id",
  lp_market_app_id: "lp_market_app_id",
  lending_manager_app_id: "lending_manager_app_id",
  pool_app_id: "pool_app_id",
  pool_manager_app_id: "pool_manager_app_id",
  op_farm_app_id: "op_farm_app_id",
  asset1_id: "asset1_id",
  asset2_id: "asset2_id",
  b_asset1_id: "b_asset1_id",
  b_asset2_id: "b_asset2_id",
  lp_asset_id: "lp_asset_id",
  
  pool_step_1: "pool_step_1",
  pool_step_2: "pool_step_2",
  pool_step_3: "pool_step_3",
  pool_step_4: "pool_step_4",
  pool_step_5: "pool_step_5",
  pool_step_6: "pool_step_6",
  pool_step_7: "pool_step_7",

  burn_step_1: "burn_step_1",
  burn_step_2: "burn_step_2",
  burn_step_3: "burn_step_3",
  burn_step_4: "burn_step_4",

  swap_step_1: "swap_step_1",
  swap_step_2: "swap_step_2",
  swap_step_3: "swap_step_3",
  swap_step_4: "swap_step_4",
  swap_step_5: "swap_step_5",
    
  swap_for_exact: "swap_for_exact",
  swap_exact_for: "swap_exact_for"
}