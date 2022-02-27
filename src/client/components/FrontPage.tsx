import { VFC, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { AppInfo, Binge, BiteInfo } from '../../common/types'
import { getStatus, submitBite } from '../api'
import { Alert } from './Alert'
import { BiteForm } from './BiteForm'
import { Heading } from './Heading'

type FpProps = {
  info: AppInfo
  initialUserStatus: Binge
}

export const FrontPage: VFC<FpProps> = ({ info, initialUserStatus }) => {
  const { realName, avatar } = info
  const [permillage, setPermillage] = useState(initialUserStatus.permillage)
  const [bingeStart, setBingeStart] = useState<Date | undefined>(initialUserStatus.bingeStart)
  const [lastBite, setLastBite] = useState<Date | undefined>(initialUserStatus.lastBite)
  const [timeTillSober, setTimeTillSober] = useState<number | undefined>(
    initialUserStatus.timeTillSober
  )
  const [loading, setLoading] = useState(false)
  const [biteDone, setBiteDone] = useState(false)
  const biteDoneRef = useRef<HTMLDivElement>(null)
  const [lastContent, setLastContent] = useState('')
  const [error, setError] = useState<string>()

  const setUserStatus = useCallback(async (statusPromise: Promise<Binge>) => {
    const userStatus = await statusPromise
    setPermillage(userStatus.permillage)
    setLastBite(userStatus.lastBite)
    setBingeStart(userStatus.bingeStart)
    setTimeTillSober(userStatus.timeTillSober)
  }, [])

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        await setUserStatus(getStatus())
      } catch (reason) {
        setError((reason as Error).message || 'No mikähän tässä nyt on')
      }
    }, 60000)
    return () => {
      clearInterval(intervalId)
    }
  }, [setUserStatus])

  const handleSubmit = async (data: BiteInfo) => {
    try {
      setLoading(true)
      setBiteDone(false)
      await setUserStatus(submitBite(data))
      setBiteDone(true)
      setLastContent(data.content)
      setError(undefined)
    } catch (reason) {
      console.error(reason)
      setPermillage(0)
      setLastBite(undefined)
      setError((reason as Error).message || 'No mikähän tässä nyt on')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const elem = biteDoneRef.current
    if (biteDone && elem) {
      const transitionListener = () => setBiteDone(false)
      setTimeout(() => (elem.style.opacity = '0'))
      elem.addEventListener('transitionend', transitionListener, true)
      return () => {
        elem.removeEventListener('transitionend', transitionListener, true)
      }
    }
  }, [biteDone])

  return (
    <FrontPageContainer>
      <Heading
        realName={realName}
        permillage={permillage}
        timeTillSober={timeTillSober}
        bingeStart={bingeStart}
        lastBite={lastBite}
        avatar={avatar}
      />

      {loading && (
        <Loading>
          <img src="/loading.gif" alt="Loading" />
        </Loading>
      )}

      {biteDone && (
        <BiteDoneContainer variant="success" ref={biteDoneRef}>
          <>
            Toppen! Raportoit puraisun &quot;{lastContent}&quot;, jonka juotuasi olet noin{' '}
            {permillage.toFixed(2)} promillen humalassa.
            <br />
            {permillage > 0.5 && <strong>Muista jättää ajaminen muille!</strong>}
          </>
        </BiteDoneContainer>
      )}

      {error && (
        <Alert variant="danger">
          Viduiks män, syy: &quot;{error}&quot;. <a href="/">Verestä sivu</a> ja kokeile uudestaan,
          tai jotain
        </Alert>
      )}

      <BiteForm submitBite={handleSubmit} />
    </FrontPageContainer>
  )
}

const FrontPageContainer = styled.div({
  display: 'flex',
  flexDirection: 'column'
})

const Loading = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16
})

const BiteDoneContainer = styled(Alert)({
  transition: 'opacity 3s 7s',
  opacity: 1
})
