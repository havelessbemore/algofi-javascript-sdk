// external imports
import algosdk, { LogicSigAccount } from "algosdk"

// CONSTANTS

export const FIXED_3_SCALE_FACTOR = 1000
export const FIXED_6_SCALE_FACTOR = 1000000
export const FIXED_9_SCALE_FACTOR = 1000000000
export const FIXED_12_SCALE_FACTOR = 1000000000000
export const FIXED_15_SCALE_FACTOR = 1000000000000000
export const FIXED_18_SCALE_FACTOR = BigInt(1000000000000000000)

export const ALGO_ASSET_ID = 1

// requires NoOp, ApplicationCall, No Rekey, No CloseRemainderTo (assits ledger users)
export const PERMISSIONLESS_SENDER_LOGIC_SIG = new LogicSigAccount(
  new Uint8Array([
    6,
    49,
    16,
    129,
    6,
    18,
    68,
    49,
    25,
    129,
    0,
    18,
    68,
    49,
    9,
    50,
    3,
    18,
    68,
    49,
    32,
    50,
    3,
    18,
    68,
    129,
    1,
    67
  ])
)

export const TEXT_ENCODER = new TextEncoder()

// ENUMS

export enum Network {
  MAINNET = 0,
  MAINNET_CLONE = 1,
  MAINNET_CLONE2 = 2,
  TESTNET = 3
}
