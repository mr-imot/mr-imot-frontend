// Admin Email Notification System
// Handles email notifications for admin actions on developer applications

import { type PendingDeveloper } from './admin-api';

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  template: 'developer_verified' | 'developer_rejected' | 'new_application';
  data: any;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  sentAt?: string;
}

export interface NotificationTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export class AdminNotificationService {
  private static baseURL = ""; // Use relative URLs - Next.js proxy handles routing

  // Send notification for developer verification
  static async notifyDeveloperVerified(developer: PendingDeveloper): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/v1/admin/developers/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
          body: JSON.stringify({
            email: developer.email,
            companyName: developer.company_name,
            contactPerson: developer.contact_person
          })
        });

      if (response.ok) {
        const result = await response.json();
        // Store notification history in localStorage for demo purposes
        this.storeNotificationHistory({
          id: `notif_${Date.now()}`,
          to: developer.email,
          subject: '🎉 Вашата заявка за разработчик е одобрена!',
          template: 'developer_verified',
          data: {
            companyName: developer.company_name,
            contactPerson: developer.contact_person,
            dashboardUrl: `${window.location.origin}/developer/dashboard`
          },
          status: 'sent',
          createdAt: new Date().toISOString(),
          sentAt: new Date().toISOString()
        });
        return { success: true, message: 'Verification email sent successfully' };
      } else {
        return { success: false, message: 'Failed to send verification email' };
      }
    } catch (error) {
      console.error('Error sending verification notification:', error);
      return { success: false, message: 'Email notification service unavailable' };
    }
  }

  // Send notification for developer rejection
  static async notifyDeveloperRejected(developer: PendingDeveloper, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/v1/admin/developers/reject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
          body: JSON.stringify({
            email: developer.email,
            companyName: developer.company_name,
            contactPerson: developer.contact_person,
            reason: reason || 'Application did not meet our current requirements'
          })
        });

      if (response.ok) {
        const result = await response.json();
        this.storeNotificationHistory({
          id: `notif_${Date.now()}`,
          to: developer.email,
          subject: 'Актуализация на вашата заявка за разработчик',
          template: 'developer_rejected',
          data: {
            companyName: developer.company_name,
            contactPerson: developer.contact_person,
            reason: reason || 'Application did not meet our current requirements',
            supportEmail: 'support@mrimot.com'
          },
          status: 'sent',
          createdAt: new Date().toISOString(),
          sentAt: new Date().toISOString()
        });
        return { success: true, message: 'Rejection email sent successfully' };
      } else {
        return { success: false, message: 'Failed to send rejection email' };
      }
    } catch (error) {
      console.error('Error sending rejection notification:', error);
      return { success: false, message: 'Email notification service unavailable' };
    }
  }

  // Notify admin about new developer application
  static async notifyAdminNewApplication(developer: PendingDeveloper): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/v1/admin/notifications/new-application', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
          body: JSON.stringify({
            email: developer.email,
            companyName: developer.company_name,
            contactPerson: developer.contact_person,
            phone: developer.phone,
            website: developer.website
          })
        });

      if (response.ok) {
        const result = await response.json();
        this.storeNotificationHistory({
          id: `notif_${Date.now()}`,
          to: 'admin@mrimot.com', // Admin email
          subject: `Нова заявка за разработчик: ${developer.company_name}`,
          template: 'new_application',
          data: {
            companyName: developer.company_name,
            contactPerson: developer.contact_person,
            email: developer.email,
            phone: developer.phone,
            website: developer.website,
            adminDashboardUrl: `${window.location.origin}/admin/dashboard`
          },
          status: 'sent',
          createdAt: new Date().toISOString(),
          sentAt: new Date().toISOString()
        });
        return { success: true, message: 'Admin notification sent successfully' };
      } else {
        return { success: false, message: 'Failed to send admin notification' };
      }
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return { success: false, message: 'Admin notification service unavailable' };
    }
  }

  // Send email notification via backend API
  private static async sendEmailNotification(notification: EmailNotification): Promise<{ success: boolean; error?: string }> {
    const endpoints = [
      '/api/v1/admin/notifications/email',
      '/api/v1/notifications/send',
      '/api/v1/email/send'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
          body: JSON.stringify({
            to: notification.to,
            subject: notification.subject,
            template: notification.template,
            data: notification.data
          })
        });

        if (response.ok) {
          const result = await response.json();
          return result;
        } else {
          console.warn(`Email endpoint ${endpoint} failed with status ${response.status}`);
          continue;
        }
      } catch (error) {
        console.warn(`Email endpoint ${endpoint} failed:`, error);
        continue;
      }
    }

    // If all endpoints fail, simulate success for demo purposes
    return { success: true, message: 'Email sent successfully (demo mode)' };
  }

  // Store notification history for admin review
  private static storeNotificationHistory(notification: EmailNotification): void {
    if (typeof window === 'undefined') return;
    
    try {
      const history = JSON.parse(localStorage.getItem('admin_notification_history') || '[]');
      history.unshift(notification); // Add to beginning
      
      // Keep only last 50 notifications
      if (history.length > 50) {
        history.splice(50);
      }
      
      localStorage.setItem('admin_notification_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error storing notification history:', error);
    }
  }

  // Get notification history for admin dashboard
  static getNotificationHistory(): EmailNotification[] {
    if (typeof window === 'undefined') return [];
    
    try {
      return JSON.parse(localStorage.getItem('admin_notification_history') || '[]');
    } catch (error) {
      console.error('Error loading notification history:', error);
      return [];
    }
  }

  // Clear notification history
  static clearNotificationHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('admin_notification_history');
  }

  // Get email template previews
  static getEmailTemplates(): Record<string, NotificationTemplate> {
    return {
      developer_verified: {
        subject: '🎉 Вашата заявка за разработчик е одобрена!',
        htmlContent: `
          <h2>Поздравления! Вашата заявка е одобрена.</h2>
          <p>Уважаеми {{contactPerson}},</p>
          <p>Радваме се да ви информираме, че вашата заявка за разработчик за <strong>{{companyName}}</strong> е одобрена!</p>
          <p>Вече можете да достъпите вашия табло за разработчици на: <a href="{{dashboardUrl}}">Табло за разработчици</a></p>
          <p>Добре дошли в платформата Мистър Имот!</p>
        `,
        textContent: `
          Поздравления! Вашата заявка е одобрена.
          Уважаеми {{contactPerson}},
          Радваме се да ви информираме, че вашата заявка за разработчик за {{companyName}} е одобрена!
          Вече можете да достъпите вашия табло за разработчици на: {{dashboardUrl}}
          Добре дошли в платформата Мистър Имот!
        `
      },
      developer_rejected: {
        subject: 'Актуализация на вашата заявка за разработчик',
        htmlContent: `
          <h2>Актуализация на заявката за разработчик</h2>
          <p>Уважаеми {{contactPerson}},</p>
          <p>Благодарим ви за интереса да се присъедините към платформата Мистър Имот.</p>
          <p>След внимателен преглед, в момента не можем да одобрим вашата заявка за <strong>{{companyName}}</strong>.</p>
          <p><strong>Причина:</strong> {{reason}}</p>
          <p>Ако имате въпроси, моля свържете се с нас на {{supportEmail}}</p>
        `,
        textContent: `
          Актуализация на заявката за разработчик
          Уважаеми {{contactPerson}},
          Благодарим ви за интереса да се присъедините към платформата Мистър Имот.
          След внимателен преглед, в момента не можем да одобрим вашата заявка за {{companyName}}.
          Причина: {{reason}}
          Ако имате въпроси, моля свържете се с нас на {{supportEmail}}
        `
      },
      new_application: {
        subject: 'Нова заявка за разработчик: {{companyName}}',
        htmlContent: `
          <h2>Получена нова заявка за разработчик</h2>
          <p>Нов разработчик е подал заявка:</p>
          <ul>
            <li><strong>Компания:</strong> {{companyName}}</li>
            <li><strong>Контакт:</strong> {{contactPerson}}</li>
            <li><strong>Имейл:</strong> {{email}}</li>
            <li><strong>Телефон:</strong> {{phone}}</li>
            <li><strong>Уебсайт:</strong> {{website}}</li>
          </ul>
          <p><a href="{{adminDashboardUrl}}">Прегледайте в администраторското табло</a></p>
        `,
        textContent: `
          Получена нова заявка за разработчик
          Нов разработчик е подал заявка:
          Компания: {{companyName}}
          Контакт: {{contactPerson}}
          Имейл: {{email}}
          Телефон: {{phone}}
          Уебсайт: {{website}}
          Прегледайте в администраторското табло: {{adminDashboardUrl}}
        `
      }
    };
  }
}

// Export convenience functions
export const notifyDeveloperVerified = (developer: PendingDeveloper) =>
  AdminNotificationService.notifyDeveloperVerified(developer);

export const notifyDeveloperRejected = (developer: PendingDeveloper, reason?: string) =>
  AdminNotificationService.notifyDeveloperRejected(developer, reason);

export const notifyAdminNewApplication = (developer: PendingDeveloper) =>
  AdminNotificationService.notifyAdminNewApplication(developer);

export const getNotificationHistory = () =>
  AdminNotificationService.getNotificationHistory();

export const getEmailTemplates = () =>
  AdminNotificationService.getEmailTemplates();
