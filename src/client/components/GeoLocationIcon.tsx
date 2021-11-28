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

const getColor = (accuracy = 1001) => {
  if (accuracy <= 10) {
    return 'hsl(89, 100%, 45%)'
  }

  if (accuracy <= 50) {
    return 'hsl(49, 100%, 50%)'
  }

  if (accuracy <= 1000) {
    return 'hsl(28, 100%, 52%)'
  }

  return 'hsl(9, 100%, 55%)'
}

const Icon = styled(FontAwesomeIcon)<GeoIconProps>(
  {
    verticalAlign: -2,
    '&&': {
      width: 16
    }
  },
  ({ coords }) => ({
    color: coords === undefined ? '#777' : getColor(coords?.accuracy)
  })
)
