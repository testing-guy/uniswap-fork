import { GetTransactionDataBuy, GetTransactionDataPayOff } from './GetStrategy'

export function GetEventLogs(
  hashBuy: string,
  hashPayoff: string
): {
  period: string
  payOff: string
} {
  const Period = GetTransactionDataBuy(hashBuy).period
  const payOffAmount = GetTransactionDataPayOff(hashPayoff).payOffData

  let period
  if (Period) {
    period = Period
  } else {
    period = '0x0'
  }

  let payOff
  if (payOffAmount) {
    payOff = payOffAmount
  } else {
    payOff = '0x0'
  }
  return { period, payOff }
}
