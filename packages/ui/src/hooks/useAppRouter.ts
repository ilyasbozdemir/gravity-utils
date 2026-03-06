import { isElectron } from '../platform'

export function useAppRouter() {
  if (isElectron) {
    const { useNavigate, useLocation } = require('react-router-dom')
    const navigate = useNavigate()
    const location = useLocation()
    return {
      push: (path: string) => navigate(path),
      replace: (path: string) => navigate(path, { replace: true }),
      pathname: location.pathname,
    }
  }
  const { useRouter } = require('next/router')
  const router = useRouter()
  return {
    push: (path: string) => router.push(path),
    replace: (path: string) => router.replace(path),
    pathname: router.pathname,
  }
}
