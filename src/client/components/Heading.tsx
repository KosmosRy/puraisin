import dayjs from 'dayjs'
import 'dayjs/locale/fi'
import utc from 'dayjs/plugin/utc'
import Timezone from 'dayjs/plugin/timezone'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import { VFC } from 'react'
import styled from 'styled-components'
import { canUseDOM } from '../utils'

type Props = {
  realName: string
  lastBite?: Date
  bingeStart?: Date
  permillage: number
  timeTillSober?: number
  avatar: string
}

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.locale('fi')

if (!canUseDOM) {
  dayjs.extend(utc)
  dayjs.extend(Timezone)
  dayjs.tz.setDefault('Europe/Helsinki')
}

const formatLastBite = (lastBite: Date) => dayjs(lastBite).format('dd, D.M.YY [klo] H:mm Z')
const formatTimeTillSober = (timeTillSober: number) => {
  if (timeTillSober > 0) {
    return dayjs().add(timeTillSober, 'seconds').fromNow(true)
  } else {
    return '-'
  }
}
const formatTimeToNow = (from?: Date) => {
  if (from) {
    return dayjs(from).toNow(true)
  } else {
    return '-'
  }
}

export const Heading: VFC<Props> = ({
  realName,
  lastBite,
  permillage,
  timeTillSober,
  avatar,
  bingeStart
}) => (
  <HeadingContainer>
    <UserRow>
      <Title>
        <h3>Pikapuraisin</h3>
        <h4>{realName}, vanha Homo Sapiens!</h4>
      </Title>
      <UserInfo>
        <img src={avatar} title={realName} alt={realName} />
        <Logout href="/auth/logout">Kirjaudu ulos</Logout>
      </UserInfo>
    </UserRow>
    <StatusRow>
      <ul>
        {lastBite && (
          <li>
            <b>Viime puraisu:</b> {formatLastBite(lastBite)}
          </li>
        )}
        {permillage > 0 && (
          <>
            <li>
              <b>Promillemäärä:</b> {permillage.toFixed(2).replace('.', ',')}
              {'\u00A0'}‰
            </li>
            <li>
              <b>Rännin pituus:</b> {formatTimeToNow(bingeStart)}
            </li>
            <li>
              <b>Selviämisarvio:</b> {formatTimeTillSober(timeTillSober || 0)}
            </li>
          </>
        )}
      </ul>
    </StatusRow>
  </HeadingContainer>
)

const HeadingContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  marginTop: 5,
  marginBottom: 16,
  gap: 10
})

const UserRow = styled.div({
  display: 'flex',
  justifyContent: 'space-between'
})

const Title = styled.div({
  h3: {
    fontSize: 32,
    fontWeight: 300,
    marginBottom: 10
  },
  h4: {
    margin: '5px 0 15px',
    fontSize: 16,
    fontWeight: 400
  }
})

const UserInfo = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  alignItems: 'flex-end',
  fontSize: 14,
  textAlign: 'right',

  img: {
    width: 48
  }
})

const StatusRow = styled.div({
  display: 'flex',

  ul: {
    listStyleType: 'none',
    li: {
      lineHeight: 1.5
    }
  }
})

const Logout = styled.a({
  padding: '4px 8px',
  borderRadius: 3.2,
  color: 'inherit',
  borderStyle: 'solid',
  borderWidth: 1,
  backgroundColor: '#ffc107',
  borderColor: '#ffc107',
  textDecoration: 'none',
  textAlign: 'center',
  fontSize: 14,
  verticalAlign: 'middle',
  lineHeight: 1.5,
  userSelect: 'none',
  fontWeight: 400,

  ':hover': {
    backgroundColor: '#e0a800',
    borderColor: '#d39e00'
  }
})
