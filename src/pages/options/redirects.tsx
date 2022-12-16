import { Navigate, useParams } from 'react-router-dom'

import CreateOption from './pages/New/index'

export function RedirectCreateOption() {
  const { currencyIdA, currencyIdB } = useParams<{ currencyIdA: string; currencyIdB: string }>()

  if (currencyIdA && currencyIdB && currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    return <Navigate to={`/add/v2/${currencyIdA}`} replace />
  }

  return <CreateOption />
}
