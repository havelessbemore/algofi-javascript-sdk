// IMPORTS

// external
import algosdk, { Algodv2, Account, Transaction, getApplicationAddress, encodeUint64, assignGroupID } from "algosdk"

// global
import { ALGO_ASSET_ID, TEXT_ENCODER, PERMISSIONLESS_SENDER_LOGIC_SIG } from "../../globals"
import { getParams, getPaymentTxn } from "../../transactionUtils"
import { concatArrays } from "../../utils"
import AlgofiUser from "../../algofiUser"

// local
import { MANAGER_STRINGS } from "./lendingConfig"
import Market from "./market"

// interface

export default class Manager {
  // constants
  public localMinBalance: number = 614000
  
  public algod: Algodv2
  public appId: number
  public address: string

  /**
   * Constructor for the manager class.
   * 
   * @param algod - an algod client
   * @param appId - app id of the manager
   */
  constructor(algod: Algodv2, appId: number) {
    this.algod = algod
    this.appId = appId
    this.address = getApplicationAddress(this.appId)
  }

  /**
   * Constructs a series of transactions that opt the user into the manager.
   * 
   * @param user - algofi user representing the user we want to opt in
   * @param storageAccount - storage account for the user
   * @returns a series of transactions that opt the user into the manager.
   */
  async getOptInTxns(user: AlgofiUser, storageAccount: Account): Promise<Transaction[]> {
    const params = await getParams(this.algod)

    // fund storage account
    let txn0 = getPaymentTxn(params, user.address, storageAccount.addr, ALGO_ASSET_ID, this.localMinBalance + 101000)

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

  /**
   * Constructs a series of transactions that opt the user out of the manager.
   * 
   * @param user - algofi user representing the user we want to opt in
   * @returns a series of transactions that opt the user out of the manager.
   */
  async getOptOutTxns(user: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)

    // close out
    params.fee = 2000
    const txn0 = algosdk.makeApplicationCloseOutTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: undefined,
      accounts: [user.lending.v2.storageAddress],
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    return [txn0]
  }

  /**
   * Constructs a series of transactions that opt the user into a market.
   * 
   * @param user - algofi user representing the user we want to opt in
   * @param market - the market we want to opt the user into
   * @returns a series of transactions that opt the user into a market.
   */
  async getMarketOptInTxns(user: AlgofiUser, market: Market): Promise<Transaction[]> {
    const params = await getParams(this.algod)

    // fund storage account
    let txn0 = getPaymentTxn(params, user.address, user.lending.v2.storageAddress, ALGO_ASSET_ID, market.localMinBalance)

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
      accounts: [user.lending.v2.storageAddress],
      foreignApps: [market.appId],
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    return assignGroupID([txn0, txn1, txn2])
  }

  /**
   * Constructs a series of transactions that opt the user out of a market.
   * 
   * @param user - algofi user representing the user we want to opt in
   * @param market - the market we want to opt the user out of 
   * @returns a series of transactions that opt the user out of a market.
   */
  async getMarketOptOutTxns(user: AlgofiUser, market: Market): Promise<Transaction[]> {
    const params = await getParams(this.algod)

    let [page, offset] = user.lending.v2.getMarketPageOffset(market.appId)

    // opt out of market
    params.fee = 3000
    let txn0 = algosdk.makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: [
        TEXT_ENCODER.encode(MANAGER_STRINGS.user_market_close_out),
        concatArrays([encodeUint64(page), encodeUint64(offset)])
      ],
      accounts: [user.lending.v2.storageAddress],
      foreignApps: [market.appId],
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    return [txn0]
  }

  // vault
  /**
   * Constructs a series of transactions that sends a governance transaction from the user.
   * 
   * @param user - algofi user representing the user we want to opt in
   * @param targetAddress - the target address we are sending the gov transaction to
   * @param note - a note to put in the governance transaction
   * @returns a series of transactions that sends a governance transaction from the user.
   */
  async getGovernanceTxns(user: AlgofiUser, targetAddress: string, note: string): Promise<Transaction[]> {
    const params = await getParams(this.algod)

    // send governance txns
    params.fee = 2000
    let txn0 = algosdk.makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: [TEXT_ENCODER.encode(MANAGER_STRINGS.send_governance_txn)],
      accounts: [user.lending.v2.storageAddress, targetAddress],
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined,
      note: TEXT_ENCODER.encode(note)
    })

    return assignGroupID([txn0])
  }

  /**
   * Constructs a series of transactions that send a keyreg transaction for
   * governance from the user.
   * 
   * @param user - algofi user representing the user we want to send the keyreg
   * txn on behalf
   * @param votePK -root participation public key
   * @param selectionPK - the VRF public key
   * @param stateProofPK - the 64 byte state proof public key commitment
   * @param voteFirst - the first round that hte participation key is valid
   * @param voteLast - The last round that th eparticipatin key is valid
   * @param voteKeyDilution - The dilution for the 2-level participation key
   * @returns a series of transactions that send a keyreg transaction for 
   * governance from the user.
   */
  async getKeyregTxns(
    user: AlgofiUser,
    votePK: string,
    selectionPK: string,
    stateProofPK: string,
    voteFirst: number,
    voteLast: number,
    voteKeyDilution: number
  ): Promise<Transaction[]> {
    const params = await getParams(this.algod)

    // opt out of market
    params.fee = 2000
    let txn0 = algosdk.makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: [
        TEXT_ENCODER.encode(MANAGER_STRINGS.send_keyreg_txn),
        new Uint8Array(Buffer.from(votePK, "base64")),
        new Uint8Array(Buffer.from(selectionPK, "base64")),
        new Uint8Array(Buffer.from(stateProofPK, "base64")),
        encodeUint64(voteFirst),
        encodeUint64(voteLast),
        encodeUint64(voteKeyDilution)
      ],
      accounts: [user.lending.v2.storageAddress],
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    return assignGroupID([txn0])
  }

  /**
   * Constructs a series of transactions that send an offlinek eyreg
   * transaction.
   * 
   * @param user - algofi user representing the user we want to send the offline
   * keyreg transaction on behalf
   * @returns - a series of transactions that send an offlinek eyreg
   * transaction.
   */
  async getKeyregOfflineTxns(user: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)

    // validate account ownership
    let txn0 = algosdk.makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: [TEXT_ENCODER.encode(MANAGER_STRINGS.validate_storage_account_txn)],
      accounts: [user.lending.v2.storageAddress],
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    // opt out of market
    params.fee = 2000
    let txn1 = algosdk.makeApplicationNoOpTxnFromObject({
      from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: [TEXT_ENCODER.encode(MANAGER_STRINGS.send_keyreg_offline_txn)],
      accounts: [user.lending.v2.storageAddress],
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    return assignGroupID([txn0, txn1])
  }
}
