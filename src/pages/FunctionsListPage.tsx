import { useNavigate } from 'react-router-dom'
import { FunctionsList } from '../components/routing'

export function FunctionsListPage() {
  const navigate = useNavigate()

  const handleSelectFunction = (id: string) => {
    navigate(`/functions/${id}`)
  }

  return <FunctionsList onSelectFunction={handleSelectFunction} />
}

