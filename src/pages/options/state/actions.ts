import { createAction } from '@reduxjs/toolkit'

export enum Field {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B',
}

export enum StrategyType {
  CALL = 'CALL',
  PUT = 'PUT',
}

export enum TimePeriod {
  SevenDays = '604800',
  FourTeenDays = '1209600',
  ThirtyDays = '2592000',
  FortyFiveDays = '3888000',
}
export const timeOptions: { label: string; value: TimePeriod }[] = [
  { label: '7D', value: TimePeriod.SevenDays },
  { label: '14D', value: TimePeriod.FourTeenDays },
  { label: '30D', value: TimePeriod.ThirtyDays },
  { label: '45D', value: TimePeriod.FortyFiveDays },
]
export const strategyOptions: { label: string; value: StrategyType }[] = [
  { label: 'CALL', value: StrategyType.CALL },
  { label: 'PUT', value: StrategyType.PUT },
]

export const typeInput = createAction<{ field: Field; typedValue: string; noLiquidity: boolean }>('mint/typeInputMint')
export const resetMintState = createAction<void>('mint/resetMintState')
