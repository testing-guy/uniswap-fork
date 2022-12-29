import { Trans } from '@lingui/macro'
import Badge, { BadgeVariant } from 'components/Badge'
import { TEXT } from 'pages/options/constants/text'
import { AlertCircle, ArrowDown, ArrowUp } from 'react-feather'
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

export default function TypeBadge({ type }: { type: string | undefined }) {
  return (
    <BadgeWrapper>
      {type === 'CALL' ? (
        <MouseoverTooltip text={<Trans>{TEXT.OPTION_LIST.CALL}</Trans>}>
          <Badge variant={BadgeVariant.POSITIVE}>
            <ArrowUp width={14} height={14} />
            &nbsp;
            <BadgeText>
              <Trans>CALL</Trans>
            </BadgeText>
          </Badge>
        </MouseoverTooltip>
      ) : type === 'PUT' ? (
        <MouseoverTooltip text={<Trans>{TEXT.OPTION_LIST.PUT}</Trans>}>
          <Badge variant={BadgeVariant.NEGATIVE}>
            <ArrowDown width={14} height={14} /> &nbsp;
            <BadgeText>
              <Trans>PUT</Trans>
            </BadgeText>
          </Badge>
        </MouseoverTooltip>
      ) : (
        <MouseoverTooltip text={<Trans>{TEXT.OPTION_LIST.EMPTY}</Trans>}>
          <Badge variant={BadgeVariant.DEFAULT}>
            <AlertCircle width={14} height={14} />
          </Badge>
        </MouseoverTooltip>
      )}
    </BadgeWrapper>
  )
}
