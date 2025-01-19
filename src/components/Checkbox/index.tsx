import React, { FC, InputHTMLAttributes } from 'react';
import cx from 'classnames';

type CheckboxProps = {
  id?: InputHTMLAttributes<HTMLInputElement>['id'],
  value?: InputHTMLAttributes<HTMLInputElement>['value'],
  onChange?: (e?: React.ChangeEvent<HTMLInputElement>) => void,
  checked: InputHTMLAttributes<HTMLInputElement>['checked'],
  disabled?: InputHTMLAttributes<HTMLInputElement>['disabled'],
  className?: string,
};

export const Checkbox: FC<React.PropsWithChildren<CheckboxProps>> = ({
  id,
  checked,
  onChange,
  className,
  disabled,
  children,
}) => {
  return(
    <label className={cx(
      'flex items-center space-x-2 cursor-pointer',
      { 'text-gray-500': disabled },
      className
    )}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        className="accent-blue-700"
        onChange={onChange}
        disabled={disabled}
      />
      <div className="text-sm leading-normal">
        {children}
      </div>
    </label>
  );
};