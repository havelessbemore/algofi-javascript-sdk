// IMPORTS

// external
import algosdk, { Address, encodeAddress } from "algosdk"

// FUNCTIONS

export function concatArrays(arrays: Uint8Array[]) {
  // sum of individual array lengths
  let totalLength = arrays.reduce((acc, value) => acc + value.length, 0)

  if (!arrays.length) return null

  let result = new Uint8Array(totalLength)

  // for each array - copy it over result
  // next array is copied right after the previous one
  let length = 0
  for (let array of arrays) {
    result.set(array, length)
    length += array.length
  }

  return result
}

export function formatPrefixState(state: {}): {} {
  const formattedState = {}
  for (const [key, value] of Object.entries(state)) {
    const indexUnderScore = key.indexOf("_")
    // case when it is a prefix term
    if (indexUnderScore > 0) {
      const prefix = key.substring(0, indexUnderScore + 1)
      const hex = key.substring(indexUnderScore + 1)
      const formatted = Uint8Array.from(hex, e => e.charCodeAt(0))
      const number = formatted[7]
      formattedState[prefix + number.toString()] = value
    } else {
      formattedState[key] = value
    }
  }
  return formattedState
}

export function parseAddressBytes(bytes: string): string {
  return encodeAddress(Buffer.from(bytes, "base64"))
}

export function decodeBytes(bytes: string): Uint8Array {
  let result = new Uint8Array(bytes.length)
  for (var i = 0; i < bytes.length; ++i) {
    result[i] = bytes.charCodeAt(i)
  }
  return result
}

export function addressEquals(a: Address, b: Address): boolean {
  return (
    a.publicKey.length == b.publicKey.length &&
    a.publicKey.every((val, index) => val == b.publicKey[index]) &&
    a.checksum.length == b.checksum.length &&
    a.checksum.every((val, index) => val == b.checksum[index])
  )
}
