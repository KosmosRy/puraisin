import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { alertVariant, container } from './Alert.css';

type Props = HTMLAttributes<HTMLDivElement> & {
  variant: 'success' | 'danger';
  children: ReactNode;
};

export const Alert = forwardRef<HTMLDivElement, Props>(({ variant, className, children }, ref) => (
  <div ref={ref} className={`${container} ${alertVariant[variant]} ${className ?? ''}`}>
    {children}
  </div>
));

Alert.displayName = 'Alert';
