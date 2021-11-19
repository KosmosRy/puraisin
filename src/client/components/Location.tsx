import { ChangeEvent, useEffect, useState, VFC } from 'react'
import { formatDM } from '../../common/utils'
import styled from 'styled-components'
import { GeoLocationIcon } from './GeoLocationIcon'

export type LocationEvent = { location: string; customLocation?: string }

type LocationProps = {
  location: string
  setCoordinates: (coords?: GeolocationCoordinates | null) => void
  customLocation?: string
  handleChange: (event: LocationEvent) => void
}

export const Location: VFC<LocationProps> = ({
  location,
  setCoordinates,
  handleChange,
  customLocation
}) => {
  const [localCoords, setLocalCoords] = useState<GeolocationCoordinates | null>()

  useEffect(() => {
    if (navigator && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            altitudeAccuracy: pos.coords.altitudeAccuracy,
            heading: pos.coords.heading,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speed: pos.coords.speed
          }
          setCoordinates(coords)
          setLocalCoords(coords)
        },
        (err) => {
          console.error(err)
          setCoordinates(null)
          setLocalCoords(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      )
      return () => {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [setCoordinates])

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event

    if (target.type === 'radio') {
      handleChange({ location: target.value, customLocation })
    } else {
      handleChange({ location, customLocation: target.value })
    }
  }

  return (
    <>
      <label>
        Missä?
        <i title={formatDM(localCoords)}>
          {' '}
          <GeoLocationIcon coords={localCoords} />
        </i>
      </label>

      <LocationRow>
        <label>
          <input
            type="radio"
            name="location"
            value="koti"
            checked={location === 'koti'}
            onChange={onChange}
          />{' '}
          Koti
        </label>

        <label>
          <input
            type="radio"
            name="location"
            value="työ"
            checked={location === 'työ'}
            onChange={onChange}
          />{' '}
          Työ
        </label>

        <label>
          <input
            type="radio"
            name="location"
            value="baari"
            checked={location === 'baari'}
            onChange={onChange}
          />{' '}
          Baari
        </label>

        <label>
          <input
            type="radio"
            name="location"
            value="else"
            checked={location === 'else'}
            onChange={onChange}
          />{' '}
          Muu
        </label>
      </LocationRow>

      {location === 'else' && (
        <div>
          <input
            type="text"
            id="customlocation-input"
            placeholder="Missäs sitten?"
            value={customLocation || ''}
            onChange={onChange}
            name="customLocation"
            required={true}
          />
        </div>
      )}
    </>
  )
}

const LocationRow = styled.div`
  display: flex;
  margin: 8px 0;
  gap: 8px;
`
