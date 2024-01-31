import { faCompass } from '@fortawesome/free-solid-svg-icons/faCompass';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons/faLocationArrow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { type FC } from 'react';
import { icon, iconColor } from './GeolocationIcon.css';

const locationIcon = (coords?: GeolocationCoordinates | null) => {
  if (coords === undefined) {
    return faCompass;
  }

  if (coords === null) {
    return faExclamationTriangle;
  }

  return faLocationArrow;
};

interface GeoIconProps {
  coords?: GeolocationCoordinates | null;
}

const getColor = (coords?: GeolocationCoordinates | null) => {
  if (coords === undefined) {
    return '#777';
  }

  const accuracy = coords?.accuracy ?? 1001;

  if (accuracy <= 10) {
    return 'hsl(89, 100%, 45%)';
  }

  if (accuracy <= 50) {
    return 'hsl(49, 100%, 50%)';
  }

  if (accuracy <= 1000) {
    return 'hsl(28, 100%, 52%)';
  }

  return 'hsl(9, 100%, 55%)';
};

export const GeolocationIcon: FC<GeoIconProps> = ({ coords }) => (
  <FontAwesomeIcon
    icon={locationIcon(coords)}
    spin={coords === undefined}
    className={icon}
    style={assignInlineVars({ [iconColor]: getColor(coords) })}
  />
);
