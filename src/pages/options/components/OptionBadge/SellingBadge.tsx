import { Trans } from '@lingui/macro'
import Badge, { BadgeVariant } from 'components/Badge'
import { TEXT } from 'pages/options/constants/text'
import styled from 'styled-components/macro'

import { MouseoverTooltip } from '../../../../components/Tooltip'

const BadgeWrapper = styled.div`
  font-size: 14px;
  display: flex;
  justify-content: flex-end;
`

const BadgeText = styled.div`
  font-weight: 500;
  font-size: 14px;
`

const ActiveDot = styled.span`
  background-color: ${({ theme }) => theme.deprecated_success};
  border-radius: 50%;
  height: 8px;
  width: 8px;
  margin-right: 4px;
`

const InactiveDot = styled.span`
  background-color: ${({ theme }) => theme.deprecated_red1};
  border-radius: 50%;
  height: 8px;
  width: 8px;
  margin-right: 4px;
`

export default function SellingBadge({
  sellable,
  isSell,
}: {
  sellable: boolean | undefined
  isSell: boolean | undefined
}) {
  return (
    <BadgeWrapper>
      {sellable ? (
        <MouseoverTooltip text={<Trans>{TEXT.BADGE.SELLABLE}</Trans>}>
          <Badge variant={BadgeVariant.DEFAULT}>
            <ActiveDot />
            &nbsp;
            <BadgeText>
              <Trans>Sellable</Trans>
            </BadgeText>
          </Badge>
        </MouseoverTooltip>
      ) : isSell ? (
        <MouseoverTooltip text={<Trans>{TEXT.BADGE.INSELL}</Trans>}>
          <Badge variant={BadgeVariant.POSITIVE}>
            <BadgeText>
              <Trans>In Sell</Trans>
            </BadgeText>
          </Badge>
        </MouseoverTooltip>
      ) : (
        <MouseoverTooltip text={<Trans>{TEXT.BADGE.UNSELLABLE}</Trans>}>
          <Badge variant={BadgeVariant.DEFAULT}>
            <InactiveDot />
            &nbsp;
            <BadgeText>
              <Trans>Unsellable</Trans>
            </BadgeText>
          </Badge>
        </MouseoverTooltip>
      )}
    </BadgeWrapper>
  )
}
