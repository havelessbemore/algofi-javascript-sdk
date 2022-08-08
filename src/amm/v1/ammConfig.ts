// ENUMS

export enum PoolType {
  LOW_FEE = 0,
  HIGH_FEE = 1,
  NANO = 2,
  MOVING_RATIO_NANO = 3
}

// SWAP FEES

export function getSwapFee(poolType: PoolType) {
  if (poolType == PoolType.LOW_FEE) {
    return 0.0025
  } else if (poolType == PoolType.HIGH_FEE) {
    return 0.0075
  } else {
    return 0.0005
  }
}

// STRING CONSTANTS

export const POOL_STRINGS = {
  manager_app_id: "ma",
  asset1_id: "a1",
  asset2_id: "a2",
  lp_id: "l",
  asset1_reserve: "a1r",
  asset2_reserve: "a2r",
  balance_1: "b1",
  balance_2: "b2",
  lp_circulation: "lc",
  pool: "p",
  redeem_pool_asset1_residual: "rpa1r",
  redeem_pool_asset2_residual: "rpa2r",
  burn_asset1_out: "ba1o",
  burn_asset2_out: "ba2o",
  swap_exact_for: "sef",
  swap_for_exact: "sfe",
  redeem_swap_residual: "rsr",
  
  // nano
  initial_amplification_factor: "iaf",
  future_amplification_factor: "faf",
  initial_amplification_factor_time: "iat",
  future_amplification_factor_time: "fat",
  ramp_amplification_factor: "raf",
  
  // moving ration nano
  target_ratio_adjustment_start_time: "trast",
  target_ratio_adjustment_end_time: "traet",
  initial_target_asset1_to_asset2_ratio: "it1t2r",
  current_target_asset1_to_asset2_ratio: "ct1t2r",
  goal_target_asset1_to_asset2_ratio: "gt1t2r"
}