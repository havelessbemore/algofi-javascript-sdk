// IMPORTS

// external
import algosdk, { Algodv2, encodeAddress } from "algosdk"

// local
import { Base64Encoder } from "./encoder"

// FUNCTIONS

/**
 * Function to get global state of an application
 *
 * @param   {Algodv2}           algodClient
 *
 * @return  {dict<string,any>}  dictionary of global state
 */
export async function getApplicationGlobalState(algodClient: Algodv2, applicationId : number): Promise<{}> {
  let response = await algodClient.getApplicationByID(applicationId).do()
  let results = {}

  await Promise.all(
    response.params["global-state"].map( async (x) => {
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
 * Function to get local state for a given address and application
 *
 * @param   {Algodv2}           algodClient
 * @param   {string}            address
 *
 * @return  {dict<number,dict{string:any}>}  dictionary of user local states
 */
export async function getLocalStates(algodClient: Algodv2, address : string, addressFields: string[] = []): Promise<{}> {
	let results = {}

  let accountInfo = await algodClient.accountInformation(address).do()
  await Promise.all(
    accountInfo["apps-local-state"].map(async (appLocalState) => {
      if (appLocalState["key-value"]) {
        let localState = {}
        await Promise.all(
          appLocalState["key-value"].map(async (x) => {
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
 * Function to get balances for an account
*
 * @param   {Algodv2}           algodClient
 * @param   {string}            address
 *
 * @return  {dict<string,int>}  dictionary of assets to amounts
 */
export async function getAccountBalances(algodClient: Algodv2, address : string): Promise<{}> {
  let results = {}
  let accountInfo = await algodClient.accountInformation(address).do()
  results[1] = accountInfo["amount"]
  await Promise.all(
    accountInfo["assets"].map(async (x) => {
      results[x["asset-id"]] = x["amount"]
    })
  )
  return results
}
