"use client";

import { Suspense } from 'react';
import { PasswordResetForm } from '@/components/auth/password-reset-form';
import { SUCCESS_MESSAGES } from '@/lib/auth-constants';

function ResetPasswordContent() {
  const handlePasswordReset = async (token: string, newPassword: string) => {
    try {
      // Call the backend API directly
      const response = await fetch('/api/v1/auth/developers/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }

      // Success is handled by PasswordResetForm component
    } catch (error) {
      throw error; // Re-throw to let PasswordResetForm handle it
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ds-primary-50 via-white to-ds-accent-50 py-ds-8 px-ds-2 flex items-center justify-center">
      <PasswordResetForm onSubmit={handlePasswordReset} />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-ds-primary-50 via-white to-ds-accent-50 py-ds-8 px-ds-2 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}