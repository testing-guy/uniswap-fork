import { BigNumber } from '@ethersproject/bignumber'

import { GetPayOffLogs, GetPeriodLogs, GetStrategyAddressbyId } from './GetStrategy'

export function GetOptionState(
  operationalAddress: string,
  strategy: string,
  parsedTokenId: BigNumber | undefined
): {
  isClaimed: boolean
  isExpired: boolean
  isOpen: number
  optionState: string
  paidAmountHex: string
  paidAmountHexFix: string
  periodHexFix: number
  expired: string
  expiredLeft: string
} {
  const getStrategy = GetStrategyAddressbyId(operationalAddress, parsedTokenId)
  const currentTimestamp = () => new Date().getTime() / 10e2
  const period = Math.floor(Number(getStrategy.expiration)) - currentTimestamp()
  const formattedPeriod = (period / 60 / 60 / 24).toFixed(2)
  let isExpired = false
  let expired = formattedPeriod + ' days'
  let expiredLeft = formattedPeriod + ' days left'
  const determinateExpiration = Array.from(period.toString())[0]
  if (determinateExpiration === '-') {
    isExpired = true
  }
  if (isExpired) {
    expired = 'Expired!'
    expiredLeft = 'Expired!'
  }

  let paidAmountHex = GetPayOffLogs(parsedTokenId, operationalAddress).paidAmount
  if (!paidAmountHex) {
    paidAmountHex = '0'
  }

  let periodHex = GetPeriodLogs(parsedTokenId, strategy).period
  if (!periodHex) {
    periodHex = '0'
  }

  const state = getStrategy.state //1=active,0=inactive
  let optionState = 'Inactive'
  let isClaimed = false
  if (state == '0' || isExpired) {
    if (paidAmountHex == '0') {
      isClaimed = false
    } else {
      isClaimed = true
    }
    optionState = 'Inactive'
  } else if (state == '1' && !isExpired) {
    optionState = 'Active'
    isClaimed = false
  }

  let isOpen = 0
  if (!isClaimed && !isExpired) {
    isOpen = 1
  }

  const paidAmountHexFix = (parseInt(paidAmountHex, 16) / 10e5).toFixed(3)
  const periodHexFix = parseInt(periodHex, 16)
  return {
    isClaimed,
    isExpired,
    optionState,
    paidAmountHex,
    paidAmountHexFix,
    periodHexFix,
    expired,
    expiredLeft,
    isOpen,
  }
}
