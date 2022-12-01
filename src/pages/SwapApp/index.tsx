import '@reach/dialog/styles.css'
import 'inter-ui'
import 'polyfills'
import 'components/analytics'

import { initializeAnalytics, sendAnalyticsEvent, user } from 'analytics'
import { CUSTOM_USER_PROPERTIES, EventName, PageName } from 'analytics/constants'
import { Trace } from 'analytics/Trace'
import Loader from 'components/Loader'
import TopLevelModals from 'components/TopLevelModals'
import { useFeatureFlagsIsLoaded } from 'featureFlags'
import { NavBarVariant, useNavBarFlag } from 'featureFlags/flags/navBar'
import { useNftFlag } from 'featureFlags/flags/nft'
import { RedesignVariant, useRedesignFlag } from 'featureFlags/flags/redesign'
import { useTokensFlag } from 'featureFlags/flags/tokens'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'
import { SpinnerSVG } from 'theme/components'
import { Z_INDEX } from 'theme/zIndex'
import { getBrowser } from 'utils/browser'
import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals'

import ErrorBoundary from '.../../components/ErrorBoundary'
import Header from '.../../components/Header'
import Polling from '.../../components/Header/Polling'
import NavBar from '.../../components/NavBar'
import Popups from '.../../components/Popups'
import DarkModeQueryParamReader from '.../../theme/DarkModeQueryParamReader'
import { useAnalyticsReporter } from '../../components/analytics'
import Swap from '../Swap'

const TokenDetails = lazy(() => import('../TokenDetails'))
const Vote = lazy(() => import('../Vote'))
const NftExplore = lazy(() => import('nft/pages/explore'))
const Collection = lazy(() => import('nft/pages/collection'))
const Profile = lazy(() => import('nft/pages/profile/profile'))
const Asset = lazy(() => import('nft/pages/asset/Asset'))

const AppWrapper = styled.div<{ redesignFlagEnabled: boolean }>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  font-feature-settings: ${({ redesignFlagEnabled }) =>
    redesignFlagEnabled ? undefined : "'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on"};
`

const BodyWrapper = styled.div<{ navBarFlag: NavBarVariant }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${({ navBarFlag }) => (navBarFlag === NavBarVariant.Enabled ? `72px 0px 0px 0px` : `120px 0px 0px 0px`)};
  align-items: center;
  flex: 1;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    padding: 52px 0px 16px 0px;
  `};
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  position: fixed;
  top: 0;
  z-index: ${Z_INDEX.sticky};
`

const Marginer = styled.div`
  margin-top: 5rem;
`

function getCurrentPageFromLocation(locationPathname: string): PageName | undefined {
  switch (locationPathname) {
    case '/swap':
      return PageName.SWAP_PAGE
    case '/vote':
      return PageName.VOTE_PAGE
    case '/pool':
      return PageName.POOL_PAGE
    case '/tokens':
      return PageName.TOKENS_PAGE
    default:
      return undefined
  }
}

// this is the same svg defined in assets/images/blue-loader.svg
// it is defined here because the remote asset may not have had time to load when this file is executing
const LazyLoadSpinner = () => (
  <SpinnerSVG width="94" height="94" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M92 47C92 22.1472 71.8528 2 47 2C22.1472 2 2 22.1472 2 47C2 71.8528 22.1472 92 47 92"
      stroke="#2172E5"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SpinnerSVG>
)

export default function SwapApp() {
  const isLoaded = useFeatureFlagsIsLoaded()
  const tokensFlag = useTokensFlag()
  const navBarFlag = useNavBarFlag()
  const nftFlag = useNftFlag()
  const redesignFlagEnabled = useRedesignFlag() === RedesignVariant.Enabled

  const { pathname } = useLocation()
  const currentPage = getCurrentPageFromLocation(pathname)

  useAnalyticsReporter()
  initializeAnalytics()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    sendAnalyticsEvent(EventName.APP_LOADED)
    user.set(CUSTOM_USER_PROPERTIES.USER_AGENT, navigator.userAgent)
    user.set(CUSTOM_USER_PROPERTIES.BROWSER, getBrowser())
    user.set(CUSTOM_USER_PROPERTIES.SCREEN_RESOLUTION_HEIGHT, window.screen.height)
    user.set(CUSTOM_USER_PROPERTIES.SCREEN_RESOLUTION_WIDTH, window.screen.width)
    getCLS(({ delta }: Metric) => sendAnalyticsEvent(EventName.WEB_VITALS, { cumulative_layout_shift: delta }))
    getFCP(({ delta }: Metric) => sendAnalyticsEvent(EventName.WEB_VITALS, { first_contentful_paint_ms: delta }))
    getFID(({ delta }: Metric) => sendAnalyticsEvent(EventName.WEB_VITALS, { first_input_delay_ms: delta }))
    getLCP(({ delta }: Metric) => sendAnalyticsEvent(EventName.WEB_VITALS, { largest_contentful_paint_ms: delta }))
  }, [])

  return (
    <ErrorBoundary>
      <DarkModeQueryParamReader />
      <ApeModeQueryParamReader />
      <AppWrapper redesignFlagEnabled={redesignFlagEnabled}>
        <Trace page={currentPage}>
          <HeaderWrapper>{navBarFlag === NavBarVariant.Enabled ? <NavBar /> : <Header />}</HeaderWrapper>
          <BodyWrapper navBarFlag={navBarFlag}>
            <Popups />
            <Polling />
            <TopLevelModals />
            <Suspense fallback={<Loader />}>
              {isLoaded ? (
                <Routes>
                  <Route path="swap" element={<Swap />} />
                </Routes>
              ) : (
                <Loader />
              )}
            </Suspense>
            <Marginer />
          </BodyWrapper>
        </Trace>
      </AppWrapper>
    </ErrorBoundary>
  )
}
