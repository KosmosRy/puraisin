import dayjs from 'dayjs'
import { BiteInfo, UserStatus } from '../common/types'

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (res.ok) {
    return res.json()
  } else {
    throw new Error(res.statusText)
  }
}

const handleUserState = async (res: Response): Promise<UserStatus> => {
  const { permillage, lastBite, bingeStart } = await handleResponse<{
    permillage: number
    lastBite?: string
    bingeStart?: string
  }>(res)

  const userStatus: UserStatus = { permillage }

  if (lastBite) {
    userStatus.lastBite = dayjs(lastBite).toDate()
  }
  if (bingeStart) {
    userStatus.bingeStart = dayjs(bingeStart).toDate()
  }

  return userStatus
}

export const getStatus = async (): Promise<UserStatus> => {
  return fetch('/user-status', { cache: 'no-store', credentials: 'same-origin' }).then(
    handleUserState
  )
}

export const submitBite = async (data: BiteInfo): Promise<UserStatus> => {
  return fetch('/submit-data', {
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    cache: 'no-store',
    credentials: 'same-origin',
    method: 'POST',
    body: JSON.stringify({ ...data, tzOffset: dayjs().format('XXX') })
  }).then(handleUserState)
}
