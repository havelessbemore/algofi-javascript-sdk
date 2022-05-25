// IMPORTS

// external
import algosdk, { Address, encodeAddress } from "algosdk"

// FUNCTIONS

export function concatArrays(arrays : Uint8Array[]) {
  // sum of individual array lengths
  let totalLength = arrays.reduce((acc, value) => acc + value.length, 0);

  if (!arrays.length) return null;

  let result = new Uint8Array(totalLength);

  // for each array - copy it over result
  // next array is copied right after the previous one
  let length = 0;
  for(let array of arrays) {
    result.set(array, length);
    length += array.length;
  }

  return result;
}

export function decodeBytes(bytes: string) : Uint8Array {
  let result = new Uint8Array(bytes.length)
  for (var i = 0; i < bytes.length; ++i) {
    result[i] = bytes.charCodeAt(i)
  }
  return result
}

export function addressEquals(a: Address, b:Address) : boolean {
  return (
    a.publicKey.length == b.publicKey.length &&
    a.publicKey.every((val, index) => val == b.publicKey[index]) &&
    a.checksum.length == b.checksum.length &&
    a.checksum.every((val, index) => val == b.checksum[index])
  )
}

export function parseAddressBytes(bytes: string): string {
  return encodeAddress(Buffer.from(bytes, "base64"))
}