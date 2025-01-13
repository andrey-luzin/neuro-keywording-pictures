import { Field, Select as SelectComponent } from '@headlessui/react'
import cn from 'classnames';
import { ChevronDownIcon } from './chevron-icon';
import { PropsWithChildren, FC, useCallback } from 'react';

interface OptionType {
  value: string,
  label: string,
}

type SelectProps = {
  options: OptionType[]
  onChange?: (value: string) => void;
  selected?: OptionType['value'],
}

export const Select: FC<PropsWithChildren<SelectProps>> = ({ options, onChange, selected }) => {
  const handleChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  }, [onChange]);

  return (
    <div className="max-w-md">
      <Field>
        <div className="relative">
          <SelectComponent
            onChange={handleChange}
            className={cn(
              'py-1.5 px-4 pr-7 border-2 border-blue-700 block w-full appearance-none rounded bg-white/5 text-base text-black',
            )}
          >
            {
              options.map((option) => {
                return(
                  <option
                    key={option.value}
                    value={option.value}
                    selected={selected === option.value || false}
                  >
                    {option.label}
                  </option>
                )
              })
            }
          </SelectComponent>
          <ChevronDownIcon
            className="group pointer-events-none absolute top-3 right-2.5 size-4 fill-white/60"
            aria-hidden="true"
          />
        </div>
      </Field>
    </div>
  )
}