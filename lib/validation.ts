// Validation utilities for form fields

export interface ValidationError {
  field: string
  message: string
}

export interface FormData {
  companyName: string
  contactPerson: string
  email: string
  phone: string
  officeAddress: string
  password: string
  confirmPassword: string
  website?: string
  acceptTerms: boolean
}

export const validateForm = (data: FormData): ValidationError[] => {
  const errors: ValidationError[] = []

  // Company Name validation
  if (!data.companyName.trim()) {
    errors.push({ field: 'companyName', message: 'Company name is required' })
  } else if (data.companyName.trim().length < 2) {
    errors.push({ field: 'companyName', message: 'Company name must be at least 2 characters' })
  }

  // Contact Person validation
  if (!data.contactPerson.trim()) {
    errors.push({ field: 'contactPerson', message: 'Contact person is required' })
  } else if (data.contactPerson.trim().length < 2) {
    errors.push({ field: 'contactPerson', message: 'Contact person must be at least 2 characters' })
  }

  // Email validation
  if (!data.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' })
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' })
  }

  // Phone validation
  if (!data.phone.trim()) {
    errors.push({ field: 'phone', message: 'Phone number is required' })
  } else if (!isValidPhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' })
  }

  // Office Address validation
  if (!data.officeAddress.trim()) {
    errors.push({ field: 'officeAddress', message: 'Office address is required' })
  }

  // Password validation
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' })
  } else if (data.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' })
  } else if (!isValidPassword(data.password)) {
    errors.push({ 
      field: 'password', 
      message: 'Password must contain uppercase, lowercase, and number' 
    })
  }

  // Confirm Password validation
  if (!data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Please confirm your password' })
  } else if (data.password !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' })
  }

  // Website validation (optional)
  if (data.website && data.website.trim() && !isValidUrl(data.website)) {
    errors.push({ field: 'website', message: 'Please enter a valid URL' })
  }

  // Terms acceptance validation
  if (!data.acceptTerms) {
    errors.push({ field: 'acceptTerms', message: 'You must accept the Terms of Service and Privacy Policy' })
  }

  return errors
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  // International phone number regex - allows various formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  // Remove all non-digit characters except + for validation
  const cleanPhone = phone.replace(/[^\d+]/g, '')
  return phoneRegex.test(cleanPhone)
}

export const isValidPassword = (password: string): boolean => {
  // Must contain at least one uppercase, one lowercase, and one number
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  
  return hasUpperCase && hasLowerCase && hasNumber
}

export const isValidUrl = (url: string): boolean => {
  try {
    // Add protocol if missing
    const urlToTest = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`
    new URL(urlToTest)
    return true
  } catch {
    return false
  }
}

export const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
  return errors.find(error => error.field === field)?.message
} 