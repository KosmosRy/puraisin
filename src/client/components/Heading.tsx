import { VFC } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/fi'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import styled from 'styled-components'

type Props = {
  realName: string
  lastBite?: Date
  bingeStart?: Date
  permillage: number
  timeTillSober: number
  avatar: string
}

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.locale('fi')

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
              <b>Selviämisarvio:</b> {formatTimeTillSober(timeTillSober)}
            </li>
          </>
        )}
      </ul>
    </StatusRow>
  </HeadingContainer>
)

const HeadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 5px;
  gap: 10px;
`

const UserRow = styled.div`
  display: flex;
  justify-content: space-between;
`

const Title = styled.div`
  h3 {
    font-size: 32px;
    font-weight: 300;
    margin-bottom: 10px;
  }

  h4 {
    margin: 5px 0 15px;
    font-size: 16px;
    font-weight: 400;
  }
`

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: end;
  font-size: 14px;
  text-align: right;

  img {
    width: 48px;
  }
`

const StatusRow = styled.div`
  display: flex;

  ul {
    list-style-type: none;
  }
`

const Logout = styled.a`
  padding: 4px 8px;
  border-radius: 3.2px;
  color: inherit;
  border-style: solid;
  border-width: 1px;
  background-color: #ffc107;
  border-color: #ffc107;
  text-decoration: none;
  text-align: center;
  font-size: 14px;
  vertical-align: middle;
  line-height: 1.5;
  user-select: none;
  font-weight: 400;

  :hover {
    background-color: #e0a800;
    border-color: #d39e00;
  }
`
