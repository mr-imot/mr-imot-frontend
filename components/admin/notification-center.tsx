"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  Building,
  UserCheck,
  UserX
} from 'lucide-react';
import { sendNotification, NotificationRequest, NotificationResponse } from '@/lib/admin-api';
import { useToast } from '@/hooks/use-toast';

interface NotificationCenterProps {
  pendingDevelopers?: Array<{ id: string; email: string; company_name: string; contact_person: string }>;
}

export function NotificationCenter({ pendingDevelopers = [] }: NotificationCenterProps) {
  const [formData, setFormData] = useState<NotificationRequest>({
    to_emails: [],
    subject: '',
    message: '',
    notification_type: 'general'
  });
  const [isSending, setIsSending] = useState(false);
  const [lastResponse, setLastResponse] = useState<NotificationResponse | null>(null);
  const { toast } = useToast();

  const notificationTemplates = {
    verification_approved: {
      subject: 'Акаунт за разработчик потвърден - Добре дошли в Мистър Имот!',
      message: `Уважаеми {contact_person},

Радваме се да ви информираме, че вашият акаунт за разработчик за {company_name} е успешно потвърден и одобрен.

Вашият акаунт вече е активен и можете да:
- Достъпите таблото за разработчици
- Създавате и управлявате обяви за имоти
- Свързвате се с потенциални купувачи
- Използвате всички функции на платформата

Ако имате въпроси или се нуждаете от помощ, моля не се колебайте да се свържете с нашия екип за поддръжка.

Добре дошли в Мистър Имот!

С уважение,
Екипът на Мистър Имот`
    },
    verification_rejected: {
      subject: 'Статус на заявката за акаунт за разработчик',
      message: `Уважаеми {contact_person},

Благодарим ви за интереса да се присъедините към Мистър Имот като партньор разработчик.

След внимателен преглед на вашата заявка за {company_name}, съжаляваме да ви информираме, че в момента не можем да одобрим вашия акаунт.

Това решение може да се дължи на различни фактори, включително:
- Непълна или недостатъчна информация
- Изисквания за бизнес потвърждение
- Съображения за съвместимост с платформата

Ако смятате, че това решение е направено по грешка или ако искате да предоставите допълнителна информация, моля свържете се с нашия екип за поддръжка.

Ценим вашия интерес към Мистър Имот и ви пожелаваме успех в бъдещите ви начинания.

С уважение,
Екипът на Мистър Имот`
    },
    general_announcement: {
      subject: 'Важна актуализация от Мистър Имот',
      message: `Уважаеми {contact_person},

Надяваме се това съобщение да ви завари добре.

{message_content}

Благодарим ви, че сте част от общността на Мистър Имот.

С уважение,
Екипът на Мистър Имот`
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    const template = notificationTemplates[templateKey as keyof typeof notificationTemplates];
    if (template) {
      setFormData(prev => ({
        ...prev,
        subject: template.subject,
        message: template.message,
        notification_type: templateKey
      }));
    }
  };

  const handleEmailInput = (value: string) => {
    const emails = value.split(',').map(email => email.trim()).filter(email => email);
    setFormData(prev => ({ ...prev, to_emails: emails }));
  };

  const handleSendNotification = async () => {
    if (!formData.to_emails.length || !formData.subject || !formData.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await sendNotification(formData);
      setLastResponse(response);
      
      if (response.success) {
        toast({
          title: "Notification Sent",
          description: `Successfully sent to ${response.sent_count || formData.to_emails.length} recipients`,
        });
        
        // Reset form on success
        setFormData({
          to_emails: [],
          subject: '',
          message: '',
          notification_type: 'general'
        });
      } else {
        toast({
          title: "Notification Failed",
          description: response.message || "Failed to send notification",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const quickRecipients = {
    'All Pending': pendingDevelopers.map(dev => dev.email),
    'Verified Developers': [], // Would need to fetch verified developers
    'All Developers': [], // Would need to fetch all developers
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Notification Center</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Templates */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Templates</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTemplateSelect('verification_approved')}
              className="text-green-600 hover:text-green-700"
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Verification Approved
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTemplateSelect('verification_rejected')}
              className="text-red-600 hover:text-red-700"
            >
              <UserX className="h-4 w-4 mr-1" />
              Verification Rejected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTemplateSelect('general_announcement')}
            >
              <Building className="h-4 w-4 mr-1" />
              General Announcement
            </Button>
          </div>
        </div>

        {/* Quick Recipients */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Recipients</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(quickRecipients).map(([label, emails]) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, to_emails: emails }))}
                disabled={emails.length === 0}
              >
                <Users className="h-4 w-4 mr-1" />
                {label} ({emails.length})
              </Button>
            ))}
          </div>
        </div>

        {/* Recipients */}
        <div className="space-y-2">
          <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
          <Input
            id="recipients"
            placeholder="email1@example.com, email2@example.com"
            value={formData.to_emails.join(', ')}
            onChange={(e) => handleEmailInput(e.target.value)}
          />
          {formData.to_emails.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.to_emails.map((email, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {email}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="Notification subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Enter your message here..."
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            rows={8}
          />
          <p className="text-xs text-gray-500">
            Use placeholders like {'{contact_person}'}, {'{company_name}'}, {'{message_content}'} for dynamic content
          </p>
        </div>

        {/* Notification Type */}
        <div className="space-y-2">
          <Label htmlFor="notification-type">Notification Type</Label>
          <Select
            value={formData.notification_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, notification_type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select notification type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="verification_approved">Verification Approved</SelectItem>
              <SelectItem value="verification_rejected">Verification Rejected</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendNotification}
          disabled={isSending || !formData.to_emails.length || !formData.subject || !formData.message}
          className="w-full"
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </>
          )}
        </Button>

        {/* Last Response */}
        {lastResponse && (
          <Alert variant={lastResponse.success ? "default" : "destructive"}>
            {lastResponse.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {lastResponse.success ? (
                <>
                  Successfully sent to {lastResponse.sent_count || formData.to_emails.length} recipients.
                  {lastResponse.failed_emails && lastResponse.failed_emails.length > 0 && (
                    <div className="mt-2">
                      Failed emails: {lastResponse.failed_emails.join(', ')}
                    </div>
                  )}
                </>
              ) : (
                lastResponse.message || "Failed to send notification"
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
} 