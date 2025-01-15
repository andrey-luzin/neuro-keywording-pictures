'use client';
import React, { FC, PropsWithChildren, useMemo } from 'react';
import cn from 'classnames';
import { Spinner } from '../Spinner';

type ButtonView = 'default' | 'alert' | 'success';

interface ButtonProps {
  view?: ButtonView,
  loading?: boolean,
  disabled?: boolean,
  className?: string;
  icon?: React.ReactNode,
  as?: 'button' | 'a',
};

interface ButtonElementProps extends ButtonProps, React.ButtonHTMLAttributes<HTMLButtonElement>{};

interface LinkElementProps extends ButtonProps, React.AnchorHTMLAttributes<HTMLAnchorElement>{};

export const Button: FC<PropsWithChildren<ButtonElementProps | LinkElementProps>> = ({
  className,
  icon,
  view = 'default',
  disabled = false,
  loading = false,
  as = 'button',
  children,
  ...props
}) => {
  const color = useMemo(() => {
    if (disabled) {
      return 'gray';
    };
    switch (view) {
      case 'default':
        return 'blue';
      case 'alert':
        return 'red';
      case 'success':
        return 'green';
      default: 'blue';
    }
  }, [view, disabled]);

  const loaderColor = useMemo(() => {
    switch (view) {
      case 'default':
        return 'blue';
      case 'alert':
        return 'red';
      case 'success':
        return 'green';
      default: 'blue';
    }
  }, [view]);

  const classNames = cn(
    'py-2 px-4 rounded text-white text-base',
    !(disabled || loading) ? `hover:bg-${color}-500` : 'cursor-not-allowed',
    disabled && 'bg-gray-400',
    !disabled && `bg-${color}-700 active:bg-${color}-900 focus:bg-${color}-900`,
    'transition gap-2 inline-flex items-center justify-center text-base focus:outline-none focus-visible:ring',
    className,
  );

  // eslint-disable-next-line react/display-name
  const Loader = useMemo(() => () => {
    return <Spinner size={5} color={loaderColor} className="inline" />;
  }, [loaderColor]);
  
  if (as === 'button') {
    const { onClick, ...buttonProps } = props as ButtonElementProps;  
    return (
      <button
        onClick={!disabled ? onClick : () => {}}
        className={classNames}
        disabled={disabled || loading}
        {...buttonProps}
      >
        {icon && icon}
        {children}
        {loading && <Loader />}
      </button>
    );
  }

  if (as === 'a') {
    const { ...linkProps } = props as LinkElementProps;
    return (
      <a className={classNames} {...linkProps}>
        {icon && icon}
        {children}
        {loading && <Loader />}
      </a>
    );
  }

  return null;
};
