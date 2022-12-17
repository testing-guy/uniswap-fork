import { BaseButton } from 'components/Button'
import { LoadingRows as BaseLoadingRows } from 'components/Loader/styled'
import { darken } from 'polished'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  position: relative;
  padding: 20px;
`

export const ClickableText = styled(Text)`
  :hover {
    cursor: pointer;
  }
  color: ${({ theme }) => theme.deprecated_primary1};
`
export const MaxButton = styled.button<{ width: string }>`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.deprecated_primary5};
  border: 1px solid ${({ theme }) => theme.deprecated_primary5};
  border-radius: 0.5rem;
  font-size: 1rem;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    padding: 0.25rem 0.5rem;
  `};
  font-weight: 500;
  cursor: pointer;
  margin: 0.25rem;
  overflow: hidden;
  color: ${({ theme }) => theme.deprecated_primary1};
  :hover {
    border: 1px solid ${({ theme }) => theme.deprecated_primary1};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.deprecated_primary1};
    outline: none;
  }
`

export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

export const LoadingRows = styled(BaseLoadingRows)`
  padding-top: 48px;
  min-width: 75%;
  max-width: 960px;
  grid-column-gap: 0.5em;
  grid-row-gap: 0.8em;
  grid-template-columns: repeat(3, 1fr);

  & > div:nth-child(4n + 1) {
    grid-column: 1 / 3;
  }
  & > div:nth-child(4n) {
    grid-column: 3 / 4;
    margin-bottom: 2em;
  }
`

export const GreenButtonPrimary = styled(BaseButton)<{ redesignFlag?: boolean }>`
  background-color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.accentSuccess : theme.deprecated_green1)};
  font-size: ${({ redesignFlag }) => redesignFlag && '20px'};
  font-weight: ${({ redesignFlag }) => redesignFlag && '600'};
  padding: ${({ redesignFlag }) => redesignFlag && '16px'};
  color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.accentTextLightPrimary : 'white')};
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.deprecated_green1)};
    background-color: ${({ theme }) => darken(0.05, theme.deprecated_green1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.deprecated_green1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.deprecated_green1)};
    background-color: ${({ theme }) => darken(0.1, theme.deprecated_green1)};
  }
  &:disabled {
    background-color: ${({ theme, altDisabledStyle, disabled }) =>
      altDisabledStyle ? (disabled ? theme.deprecated_green1 : theme.deprecated_bg6) : theme.deprecated_bg6};
    color: ${({ altDisabledStyle, disabled, theme }) =>
      altDisabledStyle ? (disabled ? theme.deprecated_white : theme.deprecated_text1) : theme.deprecated_text1};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
  }
`

export const RedButtonPrimary = styled(BaseButton)<{ redesignFlag?: boolean }>`
  background-color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.accentSuccess : theme.deprecated_red1)};
  font-size: ${({ redesignFlag }) => redesignFlag && '20px'};
  font-weight: ${({ redesignFlag }) => redesignFlag && '600'};
  padding: ${({ redesignFlag }) => redesignFlag && '16px'};
  color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.accentTextLightPrimary : 'white')};
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.deprecated_red1)};
    background-color: ${({ theme }) => darken(0.05, theme.deprecated_red1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.deprecated_red1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.deprecated_red1)};
    background-color: ${({ theme }) => darken(0.1, theme.deprecated_red1)};
  }
  &:disabled {
    background-color: ${({ theme, altDisabledStyle, disabled }) =>
      altDisabledStyle ? (disabled ? theme.deprecated_red1 : theme.deprecated_bg6) : theme.deprecated_bg6};
    color: ${({ altDisabledStyle, disabled, theme }) =>
      altDisabledStyle ? (disabled ? theme.deprecated_white : theme.deprecated_text1) : theme.deprecated_text1};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
  }
`
