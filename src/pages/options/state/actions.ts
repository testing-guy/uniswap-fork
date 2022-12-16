import { createAction } from '@reduxjs/toolkit'

export enum Field {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B',
}
export enum Sub {
  CURRENCY_A = 'CURRENCY_B',
  CURRENCY_B = 'CURRENCY_B',
}

export const typeInput = createAction<{ field: Field; sub: Sub; typedValue: string; noLiquidity: boolean }>(
  'mint/typeInputMint'
)
export const resetMintState = createAction<void>('mint/resetMintState')
