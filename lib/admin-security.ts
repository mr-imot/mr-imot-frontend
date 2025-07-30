// Admin Security Utilities
// Provides security features like input sanitization, CSRF protection, and session management

import DOMPurify from 'isomorphic-dompurify';

// Input sanitization utilities
export class SecurityUtils {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
    });
  }

  /**
   * Sanitize user input for safe storage and display
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .slice(0, 1000); // Limit length
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate phone number format
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken && token.length === 64;
  }

  /**
   * Check for potential SQL injection patterns
   */
  static containsSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(--|\/\*|\*\/)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Rate limiting helper
   */
  static createRateLimiter(maxAttempts: number, windowMs: number) {
    const attempts = new Map<string, { count: number; resetTime: number }>();

    return {
      isAllowed(identifier: string): boolean {
        const now = Date.now();
        const record = attempts.get(identifier);

        if (!record || now > record.resetTime) {
          attempts.set(identifier, { count: 1, resetTime: now + windowMs });
          return true;
        }

        if (record.count >= maxAttempts) {
          return false;
        }

        record.count++;
        return true;
      },

      reset(identifier: string): void {
        attempts.delete(identifier);
      },

      getRemainingAttempts(identifier: string): number {
        const record = attempts.get(identifier);
        if (!record || Date.now() > record.resetTime) {
          return maxAttempts;
        }
        return Math.max(0, maxAttempts - record.count);
      }
    };
  }
}

// Session timeout utilities
export class SessionManager {
  private static readonly SESSION_TIMEOUT_KEY = 'admin_session_timeout';
  private static readonly ACTIVITY_KEY = 'admin_last_activity';
  private static readonly WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialize session timeout monitoring
   */
  static initializeSessionTimeout(timeoutMs: number, onTimeout: () => void, onWarning?: () => void) {
    if (typeof window === 'undefined') return;

    let warningShown = false;

    const checkSession = () => {
      const lastActivity = localStorage.getItem(this.ACTIVITY_KEY);
      if (!lastActivity) return;

      const timeSinceActivity = Date.now() - parseInt(lastActivity);
      
      if (timeSinceActivity > timeoutMs) {
        onTimeout();
        return;
      }

      if (!warningShown && onWarning && timeSinceActivity > (timeoutMs - this.WARNING_THRESHOLD)) {
        warningShown = true;
        onWarning();
      }

      if (timeSinceActivity < (timeoutMs - this.WARNING_THRESHOLD)) {
        warningShown = false;
      }
    };

    // Check every minute
    const interval = setInterval(checkSession, 60000);

    // Update activity on user interaction
    const updateActivity = () => {
      localStorage.setItem(this.ACTIVITY_KEY, Date.now().toString());
      warningShown = false;
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Initial activity update
    updateActivity();

    // Return cleanup function
    return () => {
      clearInterval(interval);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }

  /**
   * Reset session activity
   */
  static resetActivity() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACTIVITY_KEY, Date.now().toString());
    }
  }

  /**
   * Clear session data
   */
  static clearSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACTIVITY_KEY);
      localStorage.removeItem(this.SESSION_TIMEOUT_KEY);
    }
  }
}

// Content Security Policy utilities
export class CSPUtils {
  /**
   * Generate nonce for inline scripts/styles
   */
  static generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)));
  }

  /**
   * Create CSP header value for admin pages
   */
  static getCSPHeader(nonce?: string): string {
    const policies = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'" + (nonce ? ` 'nonce-${nonce}'` : ''),
      "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "font-src 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ];

    return policies.join('; ');
  }
}

// Admin-specific form validation
export class AdminFormValidator {
  /**
   * Validate developer application data
   */
  static validateDeveloperData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    const requiredFields = ['company_name', 'contact_person', 'email', 'phone', 'office_address'];
    for (const field of requiredFields) {
      if (!data[field] || typeof data[field] !== 'string' || !data[field].trim()) {
        errors.push(`${field.replace('_', ' ')} is required`);
      }
    }

    // Email validation
    if (data.email && !SecurityUtils.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    // Phone validation
    if (data.phone && !SecurityUtils.isValidPhone(data.phone)) {
      errors.push('Invalid phone format');
    }

    // Website validation (if provided)
    if (data.website && data.website.trim() && !SecurityUtils.isValidUrl(data.website)) {
      errors.push('Invalid website URL');
    }

    // Check for potential injection attacks
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && SecurityUtils.containsSQLInjection(value)) {
        errors.push(`Invalid characters detected in ${key}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize form data
   */
  static sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = SecurityUtils.sanitizeInput(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

// Export rate limiter for login attempts
export const loginRateLimiter = SecurityUtils.createRateLimiter(5, 5 * 60 * 1000); // 5 attempts per 5 minutes 