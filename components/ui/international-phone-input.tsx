"use client"

import React from 'react'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import { cn } from '@/lib/utils'

export interface InternationalPhoneInputProps {
  value: string
  onChange: (phone: string) => void
  error?: string
  disabled?: boolean
  label?: string
  required?: boolean
  defaultCountry?: string
  className?: string
  placeholder?: string
}

export function InternationalPhoneInput({
  value,
  onChange,
  error,
  disabled = false,
  label,
  required = false,
  defaultCountry = 'bg', // Bulgaria as default
  className,
  placeholder = "Enter phone number"
}: InternationalPhoneInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-ds-foreground-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <PhoneInput
          defaultCountry={defaultCountry}
          value={value}
          onChange={(phone) => onChange(phone)}
          disabled={disabled}
          placeholder={placeholder}
          inputStyle={{
            width: '100%',
            height: '2.5rem', // h-10 equivalent
            paddingLeft: '3rem', // space for flag
            fontSize: '0.875rem', // text-sm
            borderRadius: '0.375rem', // rounded-md
            border: error 
              ? '1px solid rgb(239 68 68)' // border-red-500
              : '1px solid rgb(209 213 219)', // border-gray-300
            outline: 'none',
            transition: 'border-color 0.15s ease-in-out',
            backgroundColor: disabled ? 'rgb(249 250 251)' : 'white', // bg-gray-50 if disabled
          }}
          countrySelectorStyleProps={{
            buttonStyle: {
              height: '2.5rem',
              border: error 
                ? '1px solid rgb(239 68 68)' 
                : '1px solid rgb(209 213 219)',
              borderRadius: '0.375rem 0 0 0.375rem',
              paddingLeft: '0.75rem',
              paddingRight: '0.5rem',
              backgroundColor: disabled ? 'rgb(249 250 251)' : 'white',
            },
            dropdownStyleProps: {
              style: {
                zIndex: 50,
                maxHeight: '200px',
                overflow: 'auto',
                borderRadius: '0.375rem',
                border: '1px solid rgb(209 213 219)',
                backgroundColor: 'white',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              }
            }
          }}
          inputProps={{
            'aria-label': label || 'Phone number',
            'aria-invalid': !!error,
            'aria-describedby': error ? `${label?.toLowerCase().replace(/\s+/g, '-')}-error` : undefined,
          }}
        />
      </div>
      
      {error && (
        <p 
          id={`${label?.toLowerCase().replace(/\s+/g, '-')}-error`}
          className="text-sm text-red-500 flex items-center gap-1"
        >
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
    </div>
  )
}