import { faCompass } from '@fortawesome/free-solid-svg-icons/faCompass'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons/faLocationArrow'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components'
import { VFC } from 'react'

const locationIcon = (coords?: GeolocationCoordinates | null) => {
  if (coords === undefined) {
    return faCompass
  }

  if (coords === null) {
    return faExclamationTriangle
  }

  return faLocationArrow
}

type GeoIconProps = { coords?: GeolocationCoordinates | null }

export const GeoLocationIcon: VFC<GeoIconProps> = ({ coords }) => (
  <Icon icon={locationIcon(coords)} spin={coords === undefined} coords={coords} />
)

const Icon = styled(FontAwesomeIcon)<GeoIconProps>`
  color: #777;
  vertical-align: -2px;
  ${({ coords }) =>
    (coords === null || (coords && coords.accuracy > 1000)) && 'color: hsl(9, 100%, 55%);'}
  ${({ coords }) => coords && coords.accuracy <= 1000 && 'color: hsl(28, 100%, 52%);'}
  ${({ coords }) => coords && coords.accuracy <= 50 && 'color: hsl(49, 100%, 50%);'}
  ${({ coords }) => coords && coords.accuracy <= 10 && 'color: hsl(89, 100%, 45%);'}
  
  && {
    width: 16px;
  }
`
