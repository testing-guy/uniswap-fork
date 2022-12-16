import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk-core'
import { Text } from 'rebass'

import { ButtonPrimary } from '../../../components/Button'
import CurrencyLogo from '../../../components/CurrencyLogo'
import { RowBetween, RowFixed } from '../../../components/Row'
import { Field } from '../../../state/mint/actions'
import { ThemedText } from '../../../theme'

export function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  pnl,
  strike,
  period,
  strategy,
  poolTokenPercentage,
  onAdd,
}: {
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  pnl?: string
  strike?: number
  period: string
  strategy?: string
  poolTokenPercentage?: Percent
  onAdd: () => void
}) {
  return (
    <>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>{currencies[Field.CURRENCY_A]?.symbol} Collateral</Trans>
        </ThemedText.DeprecatedBody>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} />
          <ThemedText.DeprecatedBody>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</ThemedText.DeprecatedBody>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>{currencies[Field.CURRENCY_B]?.symbol} Premium</Trans>
        </ThemedText.DeprecatedBody>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} />
          <ThemedText.DeprecatedBody>{pnl?.toString()}</ThemedText.DeprecatedBody>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>Strike </Trans>
        </ThemedText.DeprecatedBody>
        <RowFixed>
          <ThemedText.DeprecatedBody>{strike?.toString()}</ThemedText.DeprecatedBody>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <ThemedText.DeprecatedBody>
          <Trans>Period </Trans>
        </ThemedText.DeprecatedBody>
        <RowFixed>
          <ThemedText.DeprecatedBody>{period?.toString()}</ThemedText.DeprecatedBody>
        </RowFixed>
      </RowBetween>
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
        <Text fontWeight={500} fontSize={20}>
          <Trans>Create Option & Supply</Trans>
        </Text>
      </ButtonPrimary>
    </>
  )
}
