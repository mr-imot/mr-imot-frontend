"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Mail, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AuthError } from '@/components/ui/auth-error';
import { getTimingMessage } from '@/lib/auth-constants';
import { useIsMobile } from '@/hooks/use-mobile';

export interface EmailVerificationSentProps {
  email: string;
  onResend: () => Promise<void>;
  className?: string;
}

export const EmailVerificationSent: React.FC<EmailVerificationSentProps> = ({
  email,
  onResend,
  className
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [lastResent, setLastResent] = useState<Date | null>(null);
  const isMobile = useIsMobile();

  const handleResend = async () => {
    try {
      setIsResending(true);
      setResendError(null);
      await onResend();
      setLastResent(new Date());
    } catch (error) {
      setResendError(error instanceof Error ? error.message : 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  const canResend = !lastResent || (Date.now() - lastResent.getTime()) > 60000; // 1 minute cooldown
  const timingMessage = getTimingMessage(isMobile);

  return (
    <div className={cn('max-w-md mx-auto', className)}>
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Check Your Email</h2>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            We've sent a verification link to{' '}
            <span className="font-medium text-gray-900">{email}</span>
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Important:</p>
                <p className="text-sm text-amber-700">
                  {timingMessage.emailVerification}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>• Check your spam folder if you don't see the email</p>
            <p>• The link will only work once for security</p>
            <p>• You can close this page after clicking the link</p>
          </div>

          {resendError && (
            <AuthError
              error={resendError}
              onRetry={handleResend}
              showResend
              loading={isResending}
            />
          )}

          <div className="pt-2">
            <Button
              onClick={handleResend}
              disabled={!canResend || isResending}
              variant="outline"
              className="w-full"
            >
              {isResending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {!canResend ? 'Wait before resending' : "Didn't receive it? Resend"}
            </Button>
            
            {!canResend && (
              <p className="text-xs text-gray-500 text-center mt-2">
                You can request a new email in a moment
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};