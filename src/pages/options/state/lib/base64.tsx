import { BigNumber } from '@ethersproject/bignumber'
import { HEX } from 'pages/options/constants/addresses'

export function address64(address: string | undefined) {
  const base64 = HEX[64].slice(address?.slice(2).length) + address?.slice(2)
  return base64
}

export function value64(string: string | undefined) {
  const stringBN = BigNumber.from(Math.floor(Number(string)))._hex.slice(2)
  const base64 = HEX[64].slice(stringBN.length) + stringBN
  return base64
}

export function amount64(amount: string | undefined) {
  const amountBN = BigNumber.from(amount)._hex.slice(2)
  const base64 = HEX[64].slice(amountBN.length) + amountBN
  return base64
}
