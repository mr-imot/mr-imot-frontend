"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, Shield } from 'lucide-react';

export interface RateLimitInfoProps {
  type?: 'email' | 'password-reset' | 'general';
  remainingTime?: number;
  className?: string;
}

const getRateLimitMessage = (type: string, remainingTime?: number) => {
  const baseMessages = {
    email: 'For security, you can request a new verification email every 5 minutes.',
    'password-reset': 'For security, you can request a new password reset every 5 minutes.',
    general: 'For security, you can make a new request every 5 minutes.'
  };

  if (remainingTime && remainingTime > 0) {
    const minutes = Math.ceil(remainingTime / 60);
    return `Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before requesting again.`;
  }

  return baseMessages[type as keyof typeof baseMessages] || baseMessages.general;
};

export const RateLimitInfo: React.FC<RateLimitInfoProps> = ({
  type = 'general',
  remainingTime,
  className
}) => {
  const message = getRateLimitMessage(type, remainingTime);
  const isBlocked = remainingTime && remainingTime > 0;

  return (
    <div
      className={cn(
        'flex items-start gap-2 p-3 rounded-lg text-sm',
        isBlocked 
          ? 'bg-amber-50 border border-amber-200 text-amber-800'
          : 'bg-gray-50 border border-gray-200 text-gray-600',
        className
      )}
    >
      {isBlocked ? (
        <Clock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
      ) : (
        <Shield className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
      )}
      <span>{message}</span>
    </div>
  );
};