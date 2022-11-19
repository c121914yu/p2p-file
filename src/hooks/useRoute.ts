import { useLocation } from 'react-router-dom'
import { sq } from '@/utils'

export default function(): { [key: string]: string } {
  const location = useLocation()

  return {
    ...location,
    ...sq(location.search),
  }
}
