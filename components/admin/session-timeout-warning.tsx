"use client"

// Session Timeout Warning Component
// Alerts administrators when their session is about to expire

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/lib/admin-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle } from 'lucide-react';

interface SessionTimeoutWarningProps {
  warningMinutes?: number;
  sessionTimeoutMinutes?: number;
}

export function SessionTimeoutWarning({
  warningMinutes = 5,
  sessionTimeoutMinutes = 30,
}: SessionTimeoutWarningProps) {
  const { refreshToken, logout, isAuthenticated } = useAdminAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    let warningTimer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;
    let logoutTimer: NodeJS.Timeout;

    const setupTimers = () => {
      const warningTime = (sessionTimeoutMinutes - warningMinutes) * 60 * 1000;
      const logoutTime = sessionTimeoutMinutes * 60 * 1000;

      // Clear any existing timers
      clearTimeout(warningTimer);
      clearTimeout(countdownTimer);
      clearTimeout(logoutTimer);

      // Set warning timer
      warningTimer = setTimeout(() => {
        setShowWarning(true);
        setTimeLeft(warningMinutes * 60);

        // Start countdown
        countdownTimer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              logout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, warningTime);

      // Set logout timer
      logoutTimer = setTimeout(() => {
        logout();
      }, logoutTime);
    };

    const resetTimers = () => {
      setShowWarning(false);
      setTimeLeft(0);
      setupTimers();
    };

    // Setup initial timers
    setupTimers();

    // Listen for user activity to reset timers
    const handleActivity = () => {
      if (showWarning) {
        resetTimers();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(countdownTimer);
      clearTimeout(logoutTimer);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, logout, showWarning, sessionTimeoutMinutes, warningMinutes]);

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      const success = await refreshToken();
      if (success) {
        setShowWarning(false);
        setTimeLeft(0);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogoutNow = () => {
    logout();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated || !showWarning) {
    return null;
  }

  return (
    <>
      {/* Full-screen warning dialog */}
      <AlertDialog open={showWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2">
              <p>
                Your admin session will expire in{' '}
                <span className="font-bold text-orange-600">
                  {formatTime(timeLeft)}
                </span>
              </p>
              <p>
                You will be automatically logged out for security reasons.
                Click "Extend Session" to continue working.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel onClick={handleLogoutNow} variant="outline">
              Logout Now
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExtendSession}
              disabled={isExtending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isExtending ? 'Extending...' : 'Extend Session'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating countdown badge for when dialog is dismissed */}
      {showWarning && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert className="w-auto bg-orange-50 border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="flex items-center space-x-2">
              <span className="text-sm font-medium text-orange-800">
                Session expires in {formatTime(timeLeft)}
              </span>
              <Button
                size="sm"
                onClick={handleExtendSession}
                disabled={isExtending}
                className="h-6 px-2 text-xs bg-orange-600 hover:bg-orange-700"
              >
                Extend
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}

// Hook for session timeout management
export const useSessionTimeout = (timeoutMinutes: number = 30) => {
  const { logout, refreshToken } = useAdminAuth();
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
      }, timeoutMinutes * 60 * 1000);
    };

    const handleActivity = () => {
      setIsActive(true);
      resetTimeout();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial setup
    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [logout, timeoutMinutes]);

  return { isActive };
}; 