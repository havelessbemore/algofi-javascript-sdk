// IMPORTS

// external
import algosdk, {
  Algodv2,
  Account,
  Transaction,
  getApplicationAddress,
  encodeUint64,
  assignGroupID
} from "algosdk"

// global
import { ALGO_ASSET_ID, TEXT_ENCODER } from "./../globals"
import { getParams, getPaymentTxn } from "./../transactionUtils"
import { concatArrays } from "./../utils"
import AlgofiUser from "./../algofiUser"


// local
import { MANAGER_STRINGS } from "./lendingConfig"
import Market from "./market"

// interface

export default class Manager {
  public algod: Algodv2
  public appId: number
  public address: string
  
  constructor(algod: Algodv2, appId: number) {
    this.algod = algod
    this.appId = appId
    this.address = getApplicationAddress(this.appId)
  }
  
  async getOptInTxns(
    user: AlgofiUser,
    storageAccount: Account
  ) : Promise<Transaction[]> {
    const params = await getParams(this.algod)
    
    // fund storage account
    let txn0 = getPaymentTxn(params, user.address, storageAccount.addr, ALGO_ASSET_ID, 1000000) // TODO get the right number for this
    
    // storage account opt in and rekey
    const txn1 = algosdk.makeApplicationOptInTxnFromObject({
      from: storageAccount.addr,
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: [TEXT_ENCODER.encode(MANAGER_STRINGS.storage_account_opt_in)],
      accounts: undefined,
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: this.address
    })
    
    // user opt in
    const txn2 = algosdk.makeApplicationOptInTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: [TEXT_ENCODER.encode(MANAGER_STRINGS.user_opt_in)],
      accounts: [storageAccount.addr],
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })
    
    return assignGroupID([txn0, txn1, txn2])
  }
  
  async getOptOutTxns(
    user: AlgofiUser
  ) : Promise<Transaction[]> {
    const params = await getParams(this.algod)
    
    // close out
    params.fee = 2000
    const txn0 = algosdk.makeApplicationCloseOutTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: undefined,
      accounts: [user.lending.storageAddress],
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })
    
    return [txn0]
  }
  
  async getMarketOptInTxns(
    user: AlgofiUser,
    market: Market
  ) : Promise<Transaction[]> {
    const params = await getParams(this.algod)
    
    // fund storage account
    let txn0 = getPaymentTxn(params, user.address, user.lending.storageAddress, ALGO_ASSET_ID, market.localMinBalance)
    
    // validate market
    let txn1 = algosdk.makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: [TEXT_ENCODER.encode(MANAGER_STRINGS.validate_market)],
      accounts: [market.address],
      foreignApps: [market.appId],
      foreignAssets: undefined,
      rekeyTo: undefined
    })
    
    // opt into market
    params.fee = 2000
    let txn2 = algosdk.makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: [TEXT_ENCODER.encode(MANAGER_STRINGS.user_market_opt_in)],
      accounts: [user.lending.storageAddress],
      foreignApps: [market.appId],
      foreignAssets: undefined,
      rekeyTo: undefined
    })
    
    return assignGroupID([txn0, txn1, txn2])
  }
  
  async getMarketOptOutTxns(
    user: AlgofiUser,
    market: Market
  ) : Promise<Transaction[]> {
    const params = await getParams(this.algod)
    
    let [page, offset] = user.lending.getMarketPageOffset(market.appId)
    
    // opt out of market
    params.fee = 3000
    let txn0 = algosdk.makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: [TEXT_ENCODER.encode(MANAGER_STRINGS.user_market_close_out), concatArrays([encodeUint64(page), encodeUint64(offset)])],
      accounts: [user.lending.storageAddress],
      foreignApps: [market.appId],
      foreignAssets: undefined,
      rekeyTo: undefined
    })
    
    return [txn0]
  }
  
}