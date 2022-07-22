// IMPORTS

// external
import algosdk, { Algodv2, encodeAddress } from "algosdk"

// local
import { Base64Encoder } from "./encoder"
import { ALGO_ASSET_ID } from "./globals"

// FUNCTIONS

/**
 * Function to get global state of an application
 *
 * @param   {Algodv2}           algodClient
 *
 * @return  {dict<string,any>}  dictionary of global state
 */
export async function getApplicationGlobalState(algodClient: Algodv2, applicationId: number): Promise<{}> {
  let response = await algodClient.getApplicationByID(applicationId).do()
  let results = {}

  await Promise.all(
    response.params["global-state"].map(async x => {
      if (x.value.type == 1) {
        results[Base64Encoder.decode(x.key)] = x.value.bytes
      } else {
        results[Base64Encoder.decode(x.key)] = x.value.uint
      }
    })
  )
  return results
}

/**
 * Function to get local state for an account info object
 *
 * @param   {AccountInformation}           accountInfo
 *
 * @return  {dict<number,dict{string:any}>}  dictionary of user local states
 */
export async function getLocalStatesFromAccountInfo(accountInfo: object): Promise<{}> {
  let results = {}

  await Promise.all(
    accountInfo["apps-local-state"].map(async appLocalState => {
      if (appLocalState["key-value"]) {
        let localState = {}
        await Promise.all(
          appLocalState["key-value"].map(async x => {
            let key = Base64Encoder.decode(x.key)
            if (x.value.type == 1) {
              localState[key] = x.value.bytes
            } else {
              localState[key] = x.value.uint
            }
          })
        )
        results[appLocalState.id] = localState
      }
    })
  )

  return results
}

/**
 * Function to get local state for a given address and application
 *
 * @param   {Algodv2}           algodClient
 * @param   {string}            address
 *
 * @return  {dict<number,dict{string:any}>}  dictionary of user local states
 */
export async function getLocalStates(algodClient: Algodv2, address: string, addressFields: string[] = []): Promise<{}> {
  let results = {}

  let accountInfo = await algodClient.accountInformation(address).do()
  await Promise.all(
    accountInfo["apps-local-state"].map(async appLocalState => {
      if (appLocalState["key-value"]) {
        let localState = {}
        await Promise.all(
          appLocalState["key-value"].map(async x => {
            let key = Base64Encoder.decode(x.key)
            if (x.value.type == 1) {
              localState[key] = x.value.bytes
            } else {
              localState[key] = x.value.uint
            }
          })
        )
        results[appLocalState.id] = localState
      }
    })
  )

  return results
}

/**
 * Function to get balances given an account info object
 *
 * @param   {AccountInformation}           accountInfo
 *
 * @return  {dict<string,int>}  dictionary of assets to amounts
 */
export async function getAccountBalancesFromAccountInfo(accountInfo: object): Promise<{}> {
  let results = {}
  results[1] = accountInfo["amount"]
  await Promise.all(
    accountInfo["assets"].map(async x => {
      results[x["asset-id"]] = x["amount"]
    })
  )
  return results
}

/**
 * Function to get balances for an account
 *
 * @param   {Algodv2}           algodClient
 * @param   {string}            address
 *
 * @return  {dict<string,int>}  dictionary of assets to amounts
 */
export async function getAccountBalances(algodClient: Algodv2, address: string): Promise<{}> {
  let results = {}
  let accountInfo = await algodClient.accountInformation(address).do()
  results[1] = accountInfo["amount"]
  await Promise.all(
    accountInfo["assets"].map(async x => {
      results[x["asset-id"]] = x["amount"]
    })
  )
  return results
}

/**
 * Function to get min balance from an account info object
 *
 * @param   {AccountInformation}           accountInfo
 *
 * @return  {number}  min algo balance for an account
 */
export async function getAccountMinBalanceFromAccountInfo(accountInfo: object): Promise<number> {
  return accountInfo["min-balance"]
}

/**
 * Function to get min balance for an account
 *
 * @param   {Algodv2}           algodClient
 * @param   {string}            address
 *
 * @return  {number}  min algo balance for an account
 */
export async function getAccountMinBalance(algodClient: Algodv2, address: string): Promise<number> {
  let accountInfo = await algodClient.accountInformation(address).do()
  return accountInfo["min-balance"]
}

export function getTransferDetails(txn: {}) : [number, number] {
  let assetId = 0
  let amount = 0

  if (txn["tx-type"] == "pay") {
    assetId = ALGO_ASSET_ID
    amount = txn['payment-transaction']['amount']
  } else if (txn["tx-type"] == "axfer") {
    assetId = txn['asset-transfer-transaction']['asset-id']
    amount = txn['asset-transfer-transaction']['amount']
  }

  return [assetId, amount]
}