import React, { useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { usePrefetch } from '../../hooks/usePrefetch';

/**
 * Intelligent Navigation Link component that automatically prefetches Next-Page SWR API data
 * and route chunks on mouse hover or touch/keyboard focus, ensuring zero-latency navigation.
 */
const SmartLink = ({
  to,
  children,
  prefetchApi,
  isNavLink = false,
  onMouseEnter,
  onFocus,
  ...props
}) => {
  const { prefetchData } = usePrefetch();
  const prefetchedRef = useRef(false);

  const triggerPrefetch = () => {
    if (!prefetchedRef.current && prefetchApi) {
      prefetchedRef.current = true;
      prefetchData(prefetchApi);
    }
  };

  const handleMouseEnter = (e) => {
    triggerPrefetch();
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleFocus = (e) => {
    triggerPrefetch();
    if (onFocus) onFocus(e);
  };

  const Component = isNavLink ? NavLink : Link;

  return (
    <Component
      to={to}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      {...props}
    >
      {children}
    </Component>
  );
};

export default SmartLink;
