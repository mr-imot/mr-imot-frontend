"use client";

import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle } from 'lucide-react';

interface VerificationRequiredProps {
  email: string;
}

export const VerificationRequired = ({ email }: VerificationRequiredProps) => {

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-4">
                             <div>
                 <h3 className="font-medium text-lg mb-2">Manual Verification Required</h3>
                 <p className="text-gray-600">
                   Your developer account is pending manual verification by our team. 
                   You will receive an email notification once your account has been reviewed and approved.
                 </p>
                 <p className="text-gray-600 mt-2">
                   Email: <strong>{email}</strong>
                 </p>
               </div>
               
               <div className="flex items-center gap-2 text-sm text-gray-500">
                 <AlertTriangle className="h-4 w-4" />
                 <span>Waiting for manual verification - no action required from you</span>
               </div>
              
                             <div className="pt-4 border-t">
                 <p className="text-sm text-gray-600 mb-3">
                   This process typically takes 1-2 business days. You will be notified via email once your account is verified.
                 </p>
                 <div className="text-center">
                   <button
                     onClick={() => window.location.href = '/login'}
                     className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                   >
                     Back to Login
                   </button>
                 </div>
               </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
