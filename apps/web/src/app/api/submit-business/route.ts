// app/api/submit-business/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z, type ZodError } from 'zod';
import { type SubmitBusinessFormData, SubmitBusinessFormSchema } from '@/types/submitBusiness';

interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

interface ApiSuccessResponse {
  success: true;
  message: string;
  data: SubmitBusinessFormData & {
    id: string;
    submittedAt: string;
    status: string;
    timeWarning?: string;
  };
}

type ApiResponse = ApiErrorResponse | ApiSuccessResponse;

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  let requestBody: unknown;

  try {
    // Parse request body
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          message: 'Invalid JSON format in request.',
          errors: {
            'Request Format': 'Please ensure your data is valid JSON.'
          }
        },
        { status: 400 }
      );
    }

    // Validate body structure
    if (!requestBody || typeof requestBody !== 'object' || Array.isArray(requestBody)) {
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          message: 'Request body must be a JSON object.',
          errors: {
            'Request Body': 'Expected a valid JSON object.'
          }
        },
        { status: 400 }
      );
    }

    console.log('Processing business submission:', {
      fields: Object.keys(requestBody),
      hasRequired: !!(requestBody as any).name && !!(requestBody as any).description && !!(requestBody as any).email
    });

    // Validate with Zod
    const validationResult = SubmitBusinessFormSchema.safeParse(requestBody);

    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.issues.length, 'errors');
      
      const errors: Record<string, string> = {};
      
      validationResult.error.issues.forEach(issue => {
        let fieldName = 'General';
        
        if (Array.isArray(issue.path) && issue.path.length > 0) {
          const firstField = issue.path.find(p => typeof p === 'string');
          if (firstField) {
            const fieldMap: Record<string, string> = {
              name: 'Business Name',
              description: 'Business Description',
              email: 'Email Address',
              openingTime: 'Opening Time',
              closingTime: 'Closing Time',
            };
            fieldName = fieldMap[firstField] || firstField;
          }
        }
        
        errors[fieldName] = issue.message;
      });

      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          message: 'Please correct the validation errors:',
          errors
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data as SubmitBusinessFormData;

    // Check time logic if both times provided
    let timeWarning = '';
    const opening = validatedData.openingTime?.trim();
    const closing = validatedData.closingTime?.trim();
    
    if (opening && closing && opening !== '' && closing !== '') {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (timeRegex.test(opening) && timeRegex.test(closing)) {
        const openingDate = new Date(`2000-01-01T${opening}:00`);
        const closingDate = new Date(`2000-01-01T${closing}:00`);
        
        if (openingDate >= closingDate) {
          timeWarning = 'Opening time cannot be after closing time';
        }
      }
    }

    // Process data
    const processedData: SubmitBusinessFormData = {
      name: validatedData.name.trim(),
      description: validatedData.description.trim(),
      email: validatedData.email.trim(),
      openingTime: opening || '',
      closingTime: closing || '',
    };

    // Final validation of required fields
    const requiredErrors: Record<string, string> = {};
    
    if (!processedData.name.trim()) {
      requiredErrors.name = 'Business name is required';
    } else if (processedData.name.length > 100) {
      requiredErrors.name = 'Business name too long (max 100 characters)';
    }
    
    if (!processedData.description.trim()) {
      requiredErrors.description = 'Description is required';
    } else if (processedData.description.length < 10) {
      requiredErrors.description = 'Description too short (min 10 characters)';
    } else if (processedData.description.length > 500) {
      requiredErrors.description = 'Description too long (max 500 characters)';
    }
    
    if (!processedData.email.trim()) {
      requiredErrors.email = 'Email address is required';
    } else {
      const emailCheck = z.string().email().safeParse(processedData.email);
      if (!emailCheck.success) {
        requiredErrors.email = 'Please enter a valid email address';
      }
    }

    if (Object.keys(requiredErrors).length > 0) {
      const userErrors = Object.entries(requiredErrors).reduce((acc, [field, msg]) => {
        const fieldNames: Record<string, string> = {
          name: 'Business Name',
          description: 'Business Description',
          email: 'Email Address',
        };
        acc[fieldNames[field as keyof typeof fieldNames] || field] = msg;
        return acc;
      }, {} as Record<string, string>);
      
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          message: 'Missing or invalid required fields:',
          errors: userErrors
        },
        { status: 400 }
      );
    }

    // Create business record
    const businessId = `biz_${Date.now()}`;
    const submissionTime = new Date().toISOString();
    
    const savedBusiness = {
      id: businessId,
      ...processedData,
      submittedAt: submissionTime,
      status: 'pending_review',
      timeWarning: timeWarning || undefined,
      validation: {
        isValid: true,
        requiredFieldsComplete: true,
        optionalFieldsProvided: (opening ? 1 : 0) + (closing ? 1 : 0),
      },
    };

    console.log(`✅ Business "${processedData.name}" submitted successfully (ID: ${businessId})`);

    // Simulate processing (replace with database operations)
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    return NextResponse.json<ApiSuccessResponse>(
      {
        success: true,
        message: `Thank you for submitting "${processedData.name}"! Your business will be reviewed and published soon. You'll receive a confirmation at ${processedData.email}.`,
        data: savedBusiness,
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store',
          'X-Business-ID': businessId,
        },
      }
    );
    
  } catch (error) {
    console.error('Server error processing business submission:', error);
    
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      
      error.issues.slice(0, 5).forEach(issue => { // Limit to 5 errors
        let fieldName = 'General';
        
        if (Array.isArray(issue.path) && issue.path.length > 0) {
          const firstField = issue.path[0];
          if (typeof firstField === 'string') {
            const fieldMap: Record<string, string> = {
              name: 'Business Name',
              description: 'Business Description',
              email: 'Email Address',
              openingTime: 'Opening Time',
              closingTime: 'Closing Time',
            };
            fieldName = fieldMap[firstField] || firstField;
          }
        }
        
        errors[fieldName] = issue.message;
      });
      
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          message: 'Validation errors found. Please correct:',
          errors,
        },
        { status: 400 }
      );
    }

    // JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          message: 'Invalid request format.',
          errors: { Request: 'Could not parse the request data' },
        },
        { status: 400 }
      );
    }

    // Generic server errors
    const errorMessage = error instanceof Error ? error.message : 'Server error occurred';
    console.error('Detailed error:', error);
    
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: 'Unable to process your request. Please try again.',
        errors: {},
      },
      { status: 500 }
    );
  }
}