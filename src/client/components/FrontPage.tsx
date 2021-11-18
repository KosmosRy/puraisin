import { useCallback, useEffect, useState, VFC } from 'react'
import { getStatus, submitBite } from '../api'
import { Heading } from './Heading'
import { AppInfo, BiteInfo, UserStatus } from '../../common/types'
import styled from 'styled-components'
import { calcCurrentPermillage, calcTimeTillSober } from '../../common/utils'
import { BiteForm } from './BiteForm'

type FpProps = {
  info: AppInfo
  initialUserStatus: UserStatus
}

export const FrontPage: VFC<FpProps> = ({ info, initialUserStatus }) => {
  const { realName, avatar } = info
  const [permillage, setPermillage] = useState(initialUserStatus.permillage)
  const [bingeStart, setBingeStart] = useState<Date | undefined>(initialUserStatus.bingeStart)
  const [lastBite, setLastBite] = useState<Date | undefined>(initialUserStatus.lastBite)
  const [biteDone, setBiteDone] = useState(false)
  const [lastContent, setLastContent] = useState('')
  const [error, setError] = useState<string>()

  const setUserStatus = useCallback(async (statusPromise: Promise<UserStatus>) => {
    try {
      const userStatus = await statusPromise
      setPermillage(userStatus.permillage)
      setLastBite(userStatus.lastBite)
      setBingeStart(userStatus.bingeStart)
    } catch (reason) {
      console.error(reason)
      setPermillage(0)
      setLastBite(undefined)
      setError((reason as Error).message || 'No mikähän tässä nyt on')
    }
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => setUserStatus(getStatus()), 60000)
    return () => {
      clearInterval(intervalId)
    }
  }, [setUserStatus])

  const currentPermillage = permillage > 0 ? calcCurrentPermillage(permillage, lastBite) : 0
  const timeTillSober = calcTimeTillSober(currentPermillage)

  const handleSubmit = async (data: BiteInfo) => {
    console.log(data)
    /*try {
      await setUserStatus(submitBite(data))
      setBiteDone(true)
      setLastContent(data.content)
      setError(undefined)
      setTimeout(() => setBiteDone(false), 5000)
    } catch (reason) {
      console.error(reason)
      setPermillage(0)
      setLastBite(undefined)
      setError((reason as Error).message || 'No mikähän tässä nyt on')
    }*/
  }

  return (
    <FrontPageContainer>
      <Heading
        realName={realName}
        permillage={currentPermillage}
        timeTillSober={timeTillSober}
        bingeStart={bingeStart}
        lastBite={lastBite}
        avatar={avatar}
      />
      <BiteForm submitBite={handleSubmit} />
    </FrontPageContainer>
  )
}

/* return (
    <section>
      <Heading
        realName={realName}
        permillage={currentPermillage}
        timeTillSober={timeTillSober}
        bingeStart={bingeStart}
        lastBite={lastBite}
        avatar={avatar}
        logout={logout}
      />

      <TransitionGroup>
        {biteDone && (
          <CSSTransition classNames="bitesuccess" timeout={{ enter: 1, exit: 1000 }}>
            <Alert variant="success">
              <div>
                Toppen! Raportoit puraisun "{lastContent}", jonka juotuasi olet noin{' '}
                {currentPermillage.toFixed(2)} promillen humalassa.
                <br />
                {currentPermillage > 0.5 && <strong>Muista jättää ajaminen muille!</strong>}
              </div>
            </Alert>
          </CSSTransition>
        )}
      </TransitionGroup>

      {error && (
        <Alert variant="danger">
          <div>
            Viduiks män, syy: "{error}". <a href="/">Verestä sivu</a> ja kokeile uudestaan, tai
            jotain
          </div>
        </Alert>
      )}
  */

const FrontPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
`
