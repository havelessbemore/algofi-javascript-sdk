// ENUMS

export enum MarketType {
  STANDARD = 0,
  STBL = 1,
  VAULT = 2,
  LP = 3
}

// STRING CONSTANTS

export const MANAGER_STRINGS = {
  // USER STATE
  storage_account: "sa",
  user_account: "ua",
  opted_in_market_count: "omc",
  opted_in_markets_page_prefix: "om_",

  // APPLICATION CALLS
  calculate_user_position: "cup",
  farm_ops: "fo",
  send_governance_txn: "sgt",
  send_keyreg_txn: "skt",
  send_keyreg_offline_txn: "skot",
  set_market_oracle_parameters: "smop",
  storage_account_opt_in: "saoi",
  user_asset_opt_in: "uaoi",
  user_market_close_out: "umco",
  user_market_opt_in: "umoi",
  user_opt_in: "uoi",
  validate_storage_account_txn: "vsat",
  validate_market: "vm"
}

export const MARKET_STRINGS = {
  // GLOBAL STATE

  // static
  underlying_asset_id: "uai",
  b_asset_id: "bai",
  market_type: "mt",

  // parameters
  borrow_factor: "bf",
  collateral_factor: "cf",
  flash_loan_fee: "flf",
  flash_loan_protocol_fee: "flpf",
  max_flash_loan_ratio: "mflr",
  liquidation_incentive: "li",
  liquidation_fee: "lf",
  reserve_factor: "rf",
  underlying_supply_cap: "usc",
  underlying_borrow_cap: "ubc",

  // interest rate model
  base_interest_rate: "bir",
  base_interest_slope: "bis",
  quadratic_interest_amplification_factor: "eiaf",
  target_utilization_ratio: "tur",

  // oracle
  oracle_app_id: "oai",
  oracle_price_field_name: "opfn",
  oracle_price_scale_factor: "opsf",

  // balance
  underlying_cash: "uc",
  underlying_borrowed: "ub",
  underlying_reserves: "ur",
  borrow_share_circulation: "bsc",
  b_asset_circulation: "bac",
  active_b_asset_collateral: "ac",

  // interest
  latest_time: "lt",
  borrow_index: "bi",
  implied_borrow_index: "ibi",

  // rewards
  rewards_latest_time: "rlt",
  rewards_admin_prefix: "ra_",
  rewards_program_state_prefix: "rps_",
  rewards_index_prefix: "ri_",
  rewards_escrow_account: "rea",
  
  // stbl market
  underlying_protocol_reserve: "upr",

  // vault market
  opt_in_enabled: "oie",

  // USER STATE
  user_active_b_asset_collateral: "ubac",
  user_borrow_shares: "ubs",
  user_rewards_program_number_prefix: "urpn_",
  user_latest_rewards_index_prefix: "ulri_",
  user_unclaimed_rewards_prefix: "uur_",
  
  // APPLICATION CALLS
  farm_ops: "fo",
  flash_loan: "fl",
  mint_b_asset: "mba",
  add_underlying_collateral: "auc",
  add_b_asset_collateral: "abc",
  burn_b_asset: "br",
  remove_underlying_collateral: "ruc",
  remove_b_asset_collateral: "rbc",
  borrow: "b",
  repay_borrow: "rb",
  liquidate: "l",
  seize_collateral: "sc",
  claim_rewards: "cr",

  // vault market
  sync_vault: "sv"
}
