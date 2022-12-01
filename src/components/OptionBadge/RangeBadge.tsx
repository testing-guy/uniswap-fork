import { Trans } from '@lingui/macro'
import Badge, { BadgeVariant } from 'components/Badge'
import { AlertCircle } from 'react-feather'
import styled from 'styled-components/macro'

import { MouseoverTooltip } from '../Tooltip'

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

export default function RangeBadge({
  removed,
  inRange,
}: {
  removed: boolean | undefined
  inRange: boolean | undefined
}) {
  return (
    <BadgeWrapper>
      {removed ? (
        <MouseoverTooltip text={<Trans>Your position is expired without profit.</Trans>}>
          <Badge variant={BadgeVariant.DEFAULT}>
            <AlertCircle width={14} height={14} />
            &nbsp;
            <BadgeText>
              <Trans>Expired</Trans>
            </BadgeText>
          </Badge>
        </MouseoverTooltip>
      ) : inRange ? (
        <MouseoverTooltip text={<Trans>Your option is expired.</Trans>}>
          <Badge variant={BadgeVariant.DEFAULT}>
            <ActiveDot /> &nbsp;
            <BadgeText>
              <Trans>Active</Trans>
            </BadgeText>
          </Badge>
        </MouseoverTooltip>
      ) : (
        <MouseoverTooltip text={<Trans>This option is active.</Trans>}>
          <Badge variant={BadgeVariant.WARNING}>
            <AlertCircle width={14} height={14} />
            &nbsp;
            <BadgeText>
              <Trans>Inactive</Trans>
            </BadgeText>
          </Badge>
        </MouseoverTooltip>
      )}
    </BadgeWrapper>
  )
}
