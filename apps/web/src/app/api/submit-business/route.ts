// app/api/submit-business/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { type SubmitBusinessFormData, SubmitBusinessFormSchema } from '@/types/submitBusiness';

// Define possible field names
type FormFieldName = keyof SubmitBusinessFormData | 'general';

type SafeZodIssue = {
  path: (string | number | undefined)[];
  message: string;
  code: string;
  [key: string]: any;
};

interface ValidationError {
  success: false;
  message: string;
  errors: Record<string, string>;
  debug?: {
    issueCount?: number;
    rawIssues?: SafeZodIssue[];
  };
}

interface ValidationSuccess {
  success: true;
  message: string;
  data: SubmitBusinessFormData & {
    id: string;
    submittedAt: string;
    status: string;
    timeWarning?: string;
  };
}

type ApiResponse = ValidationError | ValidationSuccess;

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  let body: any = null;
  
  try {
    // Parse request body safely
    try {
      body = await request.json();
    } catch (jsonError) {
      const jsonErrorMessage = jsonError instanceof Error ? jsonError.message : 'Unknown JSON parsing error';
      console.error('Failed to parse JSON body:', jsonErrorMessage);
      return NextResponse.json<ValidationError>(
        {
          success: false,
          message: 'Invalid JSON format in request. Please check your data.',
          errors: {}
        },
        { status: 400 }
      );
    }
    
    // Validate body structure
    if (!body || typeof body !== 'object' || body === null) {
      return NextResponse.json<ValidationError>(
        {
          success: false,
          message: 'Request body must be a valid JSON object.',
          errors: {}
        },
        { status: 400 }
      );
    }

    // Log request metadata (without sensitive data)
    console.log('📥 Business submission received:', {
      method: request.method,
      contentType: request.headers.get('content-type'),
      contentLength: request.headers.get('content-length'),
      hasBodyKeys: Object.keys(body).length > 0,
      bodyKeys: Object.keys(body).filter(key => !key.toLowerCase().includes('pass') && !key.toLowerCase().includes('secret'))
    });
    
    // Validate with Zod using safeParse for better error handling
    const validationResult = SubmitBusinessFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('❌ Zod validation failed. Issues count:', validationResult.error.issues.length);
      console.error('Validation issues:', validationResult.error.issues);
      
      // Transform Zod issues to user-friendly format
      const fieldErrors: Record<FormFieldName, string> = {
        'general': 'An unexpected validation error occurred'
      };
      
      // Type-safe iteration over issues
      const issues = validationResult.error.issues as SafeZodIssue[];
      
      issues.forEach((issue: SafeZodIssue, index: number) => {
        console.log(`Validation issue ${index + 1}/${issues.length}:`, {
          path: issue.path,
          message: issue.message,
          code: issue.code,
          receivedValue: body[issue.path[0]]
        });
        
        // Extract field name safely - start with 'general' type
        let fieldName: FormFieldName = 'general';
        
        // Check if path is an array and has valid content
        if (Array.isArray(issue.path) && issue.path.length > 0) {
          // Find the first valid string path segment that matches our form fields
          const validFormField = issue.path.find(segment => {
            if (typeof segment === 'string') {
              return ['name', 'description', 'email', 'phone', 'website', 'openingTime', 'closingTime'].includes(segment);
            }
            return false;
          });
          
          if (validFormField && typeof validFormField === 'string') {
            fieldName = validFormField as FormFieldName;
          } else {
            // If not a known form field, use the first string segment or 'general'
            const firstStringSegment = issue.path.find(segment => typeof segment === 'string' && segment.length > 0);
            if (firstStringSegment && typeof firstStringSegment === 'string') {
              fieldName = firstStringSegment as FormFieldName;
            }
          }
        } else if (typeof issue.path === 'string' && issue.path.length > 0) {
          // Direct string path
          const knownFields = ['name', 'description', 'email', 'phone', 'website', 'openingTime', 'closingTime'] as const;
          if (knownFields.includes(issue.path as any)) {
            fieldName = issue.path as FormFieldName;
          }
        }
        
        // Ensure we have a valid message
        const errorMessage = typeof issue.message === 'string' && issue.message.length > 0
          ? issue.message.trim()
          : `Validation error in ${fieldName}`;
        
        // Set the error for this field, prioritizing required errors
        const isRequiredError = errorMessage.toLowerCase().includes('required') ||
                               errorMessage.toLowerCase().includes('must be') ||
                               errorMessage.toLowerCase().includes('is required');
        
        // Only set if more relevant or first error for this field
        if (isRequiredError || !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = errorMessage;
        }
        
        console.log(`Mapped error: "${fieldName}" -> "${errorMessage}"`);
      });

      // Remove the default 'general' error if we have specific field errors
      if (Object.keys(fieldErrors).length > 1 && fieldErrors['general'] && !issues.some(issue => !Array.isArray(issue.path) || issue.path.length === 0)) {
        delete fieldErrors['general'];
      }

      // Map technical field names to user-friendly names for the response
      const userFriendlyErrors: Record<string, string> = {};
      const fieldMapping: Record<FormFieldName, string> = {
        'name': 'Business Name',
        'description': 'Business Description',
        'email': 'Email Address',
        'phone': 'Phone Number',
        'website': 'Website URL',
        'openingTime': 'Opening Time',
        'closingTime': 'Closing Time',
        'general': 'Form Submission Error',
      };
      
      Object.entries(fieldErrors).forEach(([technicalName, message]) => {
        const displayName = fieldMapping[technicalName as FormFieldName];
        if (displayName) {
          userFriendlyErrors[displayName] = message;
        } else {
          // Fallback for unknown fields
          userFriendlyErrors[technicalName] = message;
        }
      });

      const errorCount = Object.keys(userFriendlyErrors).length;
      const responseData: ValidationError = { 
        success: false, 
        message: errorCount === 0 
          ? 'Validation failed due to unexpected error. Please try again.'
          : `Validation failed with ${errorCount} error${errorCount !== 1 ? 's' : ''}. Please correct the following:`,
        errors: userFriendlyErrors
      };

      // Add debug info in development
      if (process.env.NODE_ENV === 'development') {
        responseData.debug = {
          issueCount: issues.length,
          rawIssues: issues,
          technicalFieldErrors: fieldErrors,
          originalBodyKeys: Object.keys(body),
          zodVersion: z.version // Include Zod version for debugging
        };
      }

      console.error('🚫 Returning validation error response:', {
        errorCount,
        fieldsWithErrors: Object.keys(userFriendlyErrors),
        sampleBodyKeys: Object.keys(body).slice(0, 5)
      });
      
      return NextResponse.json<ValidationError>(responseData, { status: 400 });
    }

    // Validation passed - process the data
    const validatedData: SubmitBusinessFormData = validationResult.data;
    
    console.log('✅ Validation passed. Processing business data:', {
      name: validatedData.name?.substring(0, 30) + (validatedData.name?.length! > 30 ? '...' : ''),
      email: validatedData.email,
      hasPhone: !!validatedData.phone?.trim(),
      hasWebsite: !!validatedData.website?.trim(),
      hasOpeningTime: !!validatedData.openingTime?.trim(),
      hasClosingTime: !!validatedData.closingTime?.trim(),
      totalFields: Object.keys(validatedData).length,
      dataType: typeof validatedData
    });
    
    // Additional business logic validation for optional time fields
    let timeWarning = '';
    const openingTime = validatedData.openingTime?.trim();
    const closingTime = validatedData.closingTime?.trim();
    
    if (openingTime && closingTime && openingTime !== '' && closingTime !== '') {
      try {
        // Validate time format before creating Date objects
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (timeRegex.test(openingTime) && timeRegex.test(closingTime)) {
          
          const openingDate = new Date(`2000-01-01T${openingTime}:00`);
          const closingDate = new Date(`2000-01-01T${closingTime}:00`);
          
          if (openingDate >= closingDate && 
              !isNaN(openingDate.getTime()) && 
              !isNaN(closingDate.getTime())) {
            timeWarning = `Warning: Opening time (${openingTime}) appears to be after or equal to closing time (${closingTime}). This may confuse customers.`;
            console.warn(timeWarning);
          } else if (closingDate.getHours() - openingDate.getHours() > 18) {
            console.log(`Long operating hours detected: ${openingTime} to ${closingTime} (${closingDate.getHours() - openingDate.getHours()} hours)`);
          }
        } else {
          console.warn(`Invalid time format provided: opening="${openingTime}", closing="${closingTime}"`);
        }
      } catch (timeError) {
        console.error('Time parsing error:', {
          openingTime,
          closingTime,
          error: timeError instanceof Error ? timeError.message : String(timeError)
        });
      }
    }

    // Format phone number for consistency (only if provided and valid)
    const formatUKPhone = (phoneInput?: unknown): string => {
      if (!phoneInput || typeof phoneInput !== 'string' || !phoneInput.trim()) {
        return '';
      }
      
      const phone = phoneInput.trim();
      
      // Skip if already in valid international format
      if (phone.startsWith('+44') && phone.length >= 12) {
        return phone;
      }
      if (phone.startsWith('44') && phone.length >= 11) {
        return '+' + phone;
      }
      
      // Clean the phone number - keep digits, +, spaces, and common separators
      const cleaned = phone.replace(/[^\d\s+()-]/g, '');
      
      // If it's too short or doesn't look like a phone number, return original
      if (cleaned.length < 10) {
        return phone;
      }
      
      // Extract just the digits after country code
      const digitsOnly = cleaned.replace(/[^\d]/g, '');
      
      // UK mobile numbers typically start with 07 (10 digits total)
      if (digitsOnly.startsWith('07') && digitsOnly.length === 11) {
        return '+44' + digitsOnly.substring(1);
      } 
      // UK mobile numbers (10 digits starting with 7)
      else if (digitsOnly.length === 10 && digitsOnly.startsWith('7')) {
        return '+447' + digitsOnly.substring(1);
      }
      // Standard UK numbers (10 digits, may start with 0)
      else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
        return '+44' + digitsOnly.substring(1);
      }
      // Numbers starting with 44 (add + if missing)
      else if (digitsOnly.startsWith('44') && digitsOnly.length >= 11) {
        return '+' + digitsOnly;
      }
      // 10-digit numbers that don't start with 0 (likely UK numbers missing country code)
      else if (digitsOnly.length === 10 && !digitsOnly.startsWith('0')) {
        return '+44' + digitsOnly;
      }
      
      // Return formatted original if we can't identify the pattern
      return cleaned.trim();
    };

    // Format website URL (only if provided and looks valid)
    const formatWebsite = (websiteInput?: unknown): string => {
      if (!websiteInput || typeof websiteInput !== 'string' || !websiteInput.trim()) {
        return '';
      }
      
      let url = websiteInput.trim().toLowerCase();
      
      // If it's already a full URL, validate it
      if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
          const parsedUrl = new URL(url);
          // Ensure it's a valid domain (not localhost, etc.)
          if (parsedUrl.hostname && !parsedUrl.hostname.includes('localhost') && 
              !parsedUrl.hostname.startsWith('127.')) {
            return url;
          }
        } catch (urlError) {
          console.debug('Invalid full URL provided (will reformat):', url);
        }
      }
      
      // Clean up common prefixes and validate domain structure
      url = url.replace(/^www\./i, '').replace(/^[a-z]+:\/\//i, '');
      
      // Basic domain validation
      const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;
      if (!domainRegex.test(url)) {
        console.warn('Invalid domain format:', url);
        return '';
      }
      
      // Build final URL
      let finalUrl = 'https://';
      
      // Add www for simple domains (not subdomains or complex domains)
      const simpleDomain = url.match(/^[a-z0-9-]+\.(com|co\.uk|org|net|io|me|info|biz)$/i);
      if (simpleDomain && !url.includes('.' + simpleDomain[1])) {
        finalUrl += 'www.';
      }
      
      finalUrl += url;
      
      try {
        new URL(finalUrl);
        return finalUrl;
      } catch (formatError) {
        console.warn('Failed to format URL:', url, formatError);
        return `https://${url}`;
      }
    };

    // Create safely formatted data
    const formattedData: SubmitBusinessFormData = {
      name: typeof validatedData.name === 'string' && validatedData.name.trim()
        ? validatedData.name.trim()
        : '',
      description: typeof validatedData.description === 'string' && validatedData.description.trim()
        ? validatedData.description.trim()
        : '',
      email: typeof validatedData.email === 'string' && validatedData.email.trim()
        ? validatedData.email.trim()
        : '',
      phone: formatUKPhone(validatedData.phone),
      website: formatWebsite(validatedData.website),
      openingTime: typeof validatedData.openingTime === 'string'
        ? validatedData.openingTime.trim()
        : '',
      closingTime: typeof validatedData.closingTime === 'string'
        ? validatedData.closingTime.trim()
        : '',
    };

    // Final required field validation
    const requiredFieldErrors: Record<string, string> = {};
    
    // Name validation
    if (!formattedData.name || formattedData.name.trim().length < 2) {
      requiredFieldErrors.name = 'Business name is required and must be at least 2 characters long';
    } else if (formattedData.name.trim().length > 100) {
      requiredFieldErrors.name = 'Business name cannot exceed 100 characters';
    }
    
    // Description validation
    if (!formattedData.description || formattedData.description.trim().length < 10) {
      requiredFieldErrors.description = 'Business description is required and must be at least 10 characters long';
    } else if (formattedData.description.trim().length > 500) {
      requiredFieldErrors.description = 'Business description cannot exceed 500 characters';
    }
    
    // Email validation
    if (!formattedData.email || !formattedData.email.trim()) {
      requiredFieldErrors.email = 'Email address is required';
    } else {
      const emailResult = z.string().email().safeParse(formattedData.email.trim());
      if (!emailResult.success) {
        requiredFieldErrors.email = 'Please enter a valid email address (e.g., name@example.com)';
      }
    }

    // Optional field validation (only if provided)
    const optionalFieldErrors: Record<string, string> = {};
    
    // Phone validation (only if provided)
    if (formattedData.phone && formattedData.phone.trim()) {
      const phoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?\s?\d{3}\s?\d{3}|7\d{3}\s?\d{3}\s?\d{3})$/;
      if (!phoneRegex.test(formattedData.phone.trim()) || formattedData.phone.trim().length < 10) {
        optionalFieldErrors.phone = 'Please enter a valid UK phone number. Examples: 07123456789, +44 7123 456789, 07123 456789';
      }
    }
    
    // Website validation (only if provided)
    if (formattedData.website && formattedData.website.trim()) {
      const websiteRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]\.?$/;
      if (!websiteRegex.test(formattedData.website.trim()) || 
          formattedData.website.trim().length < 3 || 
          formattedData.website.trim().length > 100) {
        optionalFieldErrors.website = 'Please enter a valid domain name (e.g., example.com, www.example.co.uk). Must be 3-100 characters.';
      }
    }
    
    // Time validation (only if both provided)
    if (formattedData.openingTime && formattedData.closingTime && 
        formattedData.openingTime.trim() && formattedData.closingTime.trim()) {
      
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formattedData.openingTime.trim()) || 
          !timeRegex.test(formattedData.closingTime.trim())) {
        optionalFieldErrors.openingTime = 'Please enter valid opening time (HH:MM format, 24-hour)';
        optionalFieldErrors.closingTime = 'Please enter valid closing time (HH:MM format, 24-hour)';
      }
    }

    // Combine all errors
    const allErrors = { ...requiredFieldErrors, ...optionalFieldErrors };
    
    if (Object.keys(allErrors).length > 0) {
      console.error('Final validation failed with errors:', allErrors);
      
      // Map to user-friendly display names
      const userFriendlyErrors: Record<string, string> = {};
      const displayNames: Record<string, string> = {
        'name': 'Business Name',
        'description': 'Business Description',
        'email': 'Email Address',
        'phone': 'Phone Number',
        'website': 'Website URL',
        'openingTime': 'Opening Time',
        'closingTime': 'Closing Time'
      };
      
      Object.entries(allErrors).forEach(([fieldKey, errorMsg]) => {
        const displayName = displayNames[fieldKey as keyof typeof displayNames] || 
                           fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1');
        userFriendlyErrors[displayName] = errorMsg;
      });
      
      const errorMessage = Object.keys(requiredFieldErrors).length > 0
        ? `Required field${Object.keys(requiredFieldErrors).length > 1 ? 's' : ''} missing: ${Object.keys(requiredFieldErrors).map(key => displayNames[key as keyof typeof displayNames]).join(', ')}`
        : `Please correct the following field${Object.keys(allErrors).length > 1 ? 's' : ''}:`;
      
      return NextResponse.json<ValidationError>(
        {
          success: false,
          message: errorMessage,
          errors: userFriendlyErrors
        },
        { status: 400 }
      );
    }

    // All validations passed! Create the business record
    const businessId = `business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const submissionTime = new Date().toISOString();
    
    const savedBusiness: SubmitBusinessFormData & { 
      id: string;
      submittedAt: string;
      status: 'pending_review' | 'draft' | 'published' | 'rejected';
      timeWarning?: string;
      validation: {
        isValid: boolean;
        requiredFieldsComplete: boolean;
        optionalFieldsProvided: number;
        processedAt: string;
        warnings: string[];
      };
    } = {
      id: businessId,
      ...formattedData,
      submittedAt: submissionTime,
      status: 'pending_review' as const,
      timeWarning: timeWarning || undefined,
      validation: {
        isValid: true,
        requiredFieldsComplete: true,
        optionalFieldsProvided: [
          formattedData.phone?.trim(),
          formattedData.website?.trim(),
          formattedData.openingTime?.trim(),
          formattedData.closingTime?.trim()
        ].filter(Boolean).length,
        processedAt: new Date().toISOString(),
        warnings: timeWarning ? [timeWarning] : [],
      },
    };

    // Simulate processing (in real app, this would be database operations)
    console.log(`⏳ Processing business "${formattedData.name}" (ID: ${businessId})...`);
    
    // Simulate variable processing time based on data complexity
    const processingTime = 200 + 
      (formattedData.phone?.trim() ? 100 : 0) + 
      (formattedData.website?.trim() ? 150 : 0) + 
      (formattedData.description?.length || 0) / 10;
    
    await new Promise(resolve => setTimeout(resolve, Math.min(processingTime, 1500)));

    // Log successful submission details
    console.log(`✅ Business "${formattedData.name}" successfully processed!`);
    console.log(`📧 Will send confirmation to: ${formattedData.email}`);
    console.log(`📱 Phone: ${formattedData.phone || '[not provided]'} (${formattedData.phone ? formatUKPhone(formattedData.phone) : 'N/A'})`);
    console.log(`🌐 Website: ${formattedData.website ? formatWebsite(formattedData.website) : '[not provided]'}`);
    console.log(`🕐 Hours: ${formattedData.openingTime ? `${formattedData.openingTime}-${formattedData.closingTime}` : '[not provided]'} (${timeWarning ? '⚠️' : '✅'})`);
    console.log(`📊 Optional fields provided: ${savedBusiness.validation.optionalFieldsProvided}/4`);

    // In production, you would:
    // 1. Save to database: await prisma.business.create({ data: savedBusiness })
    // 2. Send email: await sendConfirmationEmail(formattedData.email, savedBusiness)
    // 3. Queue for review: await businessQueue.add('review-business', { id: businessId })
    // 4. Send webhook: await sendWebhook('business.submitted', savedBusiness)
    // 5. Log analytics: analytics.track('business_created', { businessId, status: 'pending_review' })

    const successResponse: ValidationSuccess = { 
      success: true, 
      message: `Thank you for submitting "${formattedData.name}"! Your business has been received and will be reviewed within 24-48 hours. You'll receive a confirmation email at ${formattedData.email} shortly.`,
      data: savedBusiness
    };

    return NextResponse.json<ValidationSuccess>(successResponse, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'X-Business-ID': businessId,
        'X-Status': 'created',
        'X-Validation': 'passed',
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });
    
  } catch (error) {
    console.error('🚨 Unexpected error in business submission API at', new Date().toISOString());
    console.error('Error type:', typeof error, error instanceof Error ? error.name : 'Unknown');
    
    // Handle JSON parsing errors (should be caught earlier, but just in case)
    if (error instanceof SyntaxError && (error as any).message?.includes('JSON')) {
      console.error('JSON parsing error:', error);
      return NextResponse.json<ValidationError>(
        {
          success: false,
          message: 'Invalid request format. Please ensure your data is valid JSON.',
          errors: {
            'Request Format': 'The data sent was not valid JSON. Please check your request and try again.'
          }
        },
        { status: 400 }
      );
    }
    
    // Handle Zod validation errors specifically
    if (error instanceof z.ZodError) {
      console.error('🔍 Zod validation error details:', {
        zodVersion: z.version,
        issueCount: error.issues.length,
        firstIssue: error.issues[0],
        allKeys: error.issues.map(i => i.path)
      });
      
      const fieldErrors: Record<FormFieldName, string> = {};
      const issues = error.issues as SafeZodIssue[];
      
      // Safe iteration with explicit bounds checking
      for (let i = 0; i < issues.length; i++) {
        const issue = issues[i];
        
        let fieldName: FormFieldName = 'general';
        
        // Safe path extraction with explicit type checking
        try {
          if (Array.isArray(issue.path) && issue.path.length > 0) {
            // Find first valid form field name
            const formFields: (keyof SubmitBusinessFormData)[] = [
              'name', 'description', 'email', 'phone', 'website', 
              'openingTime', 'closingTime'
            ];
            
            const matchingField = issue.path.find((segment, index) => {
              if (typeof segment === 'string' && formFields.includes(segment as keyof SubmitBusinessFormData)) {
                return true;
              }
              return false;
            });
            
            if (matchingField && typeof matchingField === 'string') {
              fieldName = matchingField as FormFieldName;
            } else {
              // Use first non-symbol string path segment as fallback
              for (let j = 0; j < issue.path.length; j++) {
                const segment = issue.path[j];
                if (typeof segment === 'string' && segment.length > 0 && !['index', 'root'].includes(segment)) {
                  fieldName = segment as FormFieldName;
                  break;
                }
              }
            }
          } else if (typeof issue.path === 'string' && issue.path.length > 0) {
            const knownFields = ['name', 'description', 'email', 'phone', 'website', 'openingTime', 'closingTime'];
            if (knownFields.includes(issue.path)) {
              fieldName = issue.path as FormFieldName;
            }
          }
        } catch (pathError) {
          console.warn(`⚠️ Path extraction failed for issue ${i}:`, pathError);
          fieldName = 'general';
        }
        
        const errorMessage = typeof issue.message === 'string' && issue.message.length > 0
          ? issue.message.trim()
          : `Validation error (code: ${issue.code || 'unknown'}) in ${fieldName}`;
        
        // Deduplicate errors for the same field
        if (!fieldErrors.hasOwnProperty(fieldName)) {
          fieldErrors[fieldName] = errorMessage;
        } else if (errorMessage.toLowerCase().includes('required') && !fieldErrors[fieldName].toLowerCase().includes('required')) {
          // Prioritize required field errors
          fieldErrors[fieldName] = errorMessage;
        }
      }

      // Prepare user-friendly response
      const userFriendlyErrors: Record<string, string> = {};
      const fieldMapping: Record<FormFieldName, string> = {
        'name': 'Business Name',
        'description': 'Business Description',
        'email': 'Email Address',
        'phone': 'Phone Number',
        'website': 'Website URL',
        'openingTime': 'Opening Time',
        'closingTime': 'Closing Time',
        'general': 'Form Submission Error',
      };
      
      const usedDisplayNames = new Set<string>();
      Object.entries(fieldErrors).forEach(([technicalName, message]) => {
        let displayName = fieldMapping[technicalName as FormFieldName];
        
        if (!displayName) {
          // Generate display name from technical name
          displayName = technicalName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
        }
        
        // Ensure unique display names
        let finalDisplayName = displayName;
        let counter = 1;
        while (usedDisplayNames.has(finalDisplayName)) {
          finalDisplayName = `${displayName} (${counter})`;
          counter++;
        }
        usedDisplayNames.add(finalDisplayName);
        
        userFriendlyErrors[finalDisplayName] = message;
      });

      const responseData: ValidationError = { 
        success: false, 
        message: `Your submission has validation errors. Please review the ${Object.keys(userFriendlyErrors).length} field${Object.keys(userFriendlyErrors).length !== 1 ? 's' : ''} below:`,
        errors: userFriendlyErrors
      };

      // Development debugging
      if (process.env.NODE_ENV === 'development') {
        responseData.debug = {
          zodVersion: z.version,
          issueCount: error.issues.length,
          technicalErrors: fieldErrors,
          fieldMappingUsed: Object.keys(fieldErrors),
          requestBody: {
            hasContent: !!body,
            keys: Object.keys(body || {}),
            size: body ? new Blob([JSON.stringify(body)]).size : 0
          }
        };
      }

      console.error('📤 Sending validation error response:', {
        errorFields: Object.keys(userFriendlyErrors),
        totalErrors: Object.keys(userFriendlyErrors).length
      });
      
      return NextResponse.json<ValidationError>(responseData, { status: 400 });
    }

    // Handle other server errors (network, database, etc.)
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected server error occurred while processing your request';
    
    console.error('🚨 Server processing error:', {
      errorType: error instanceof Error ? error.name : 'Unknown',
      errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      request: {
        method: request.method,
        url: request.url,
        contentLength: request.headers.get('content-length'),
        userAgent: request.headers.get('user-agent')
      },
      bodyStatus: body ? 'parsed' : 'not parsed',
      bodyKeysCount: body ? Object.keys(body).length : 0
    });
    
    const statusCode = 500;
    const isRecoverableError = error instanceof Error && (
      error.message.includes('network') || 
      error.message.includes('timeout') || 
      error.message.includes('ECONNRESET')
    );
    
    const responseData: ValidationError = {
      success: false,
      message: process.env.NODE_ENV === 'production' && !isRecoverableError
        ? 'We apologize for the inconvenience. Our team has been notified and will resolve this shortly. Please try again in a few minutes.'
        : `Server error: ${errorMessage}`,
      errors: isRecoverableError 
        ? { 'Service': 'Temporary connection issue. Please try again.' }
        : {}
    };
    
    // Detailed error information for development
    if (process.env.NODE_ENV === 'development') {
      responseData.debug = {
        errorName: error instanceof Error ? error.name : 'UnknownError',
        errorMessage,
        ...(error instanceof Error && { stack: error.stack }),
        requestContext: {
          method: request.method,
          url: request.url,
          bodyKeys: body ? Object.keys(body) : [],
          bodyType: typeof body
        },
        zodValidation: z.version,
        nodeVersion: process.version
      };
    }
    
    return NextResponse.json<ValidationError>(responseData, { 
      status: isRecoverableError ? 503 : statusCode, // Use 503 for connection issues
      headers: {
        'Cache-Control': 'no-store, no-cache',
        ...(isRecoverableError && { 
          'Retry-After': '30', // Suggest retry in 30 seconds
          'X-Retry-After': '30'
        })
      }
    });
  }
}