// app/api/submit-business/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { type SubmitBusinessFormData, SubmitBusinessFormSchema } from '@/types/submitBusiness';
import { getConvexClient } from '../../../lib/convex';
import { api } from '@onfindr-clerk-convex-next-expo/backend/convex/_generated/api';


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
  let bodyData: unknown;

  try {
    // Parse JSON safely
    try {
      bodyData = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          message: 'Invalid JSON format.',
          errors: { 'Request': 'Could not parse request data' }
        },
        { status: 400 }
      );
    }

    if (!bodyData || typeof bodyData !== 'object' || Array.isArray(bodyData)) {
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          message: 'Invalid request format.',
          errors: { 'Body': 'Expected JSON object' }
        },
        { status: 400 }
      );
    }

    // Validate with Zod
    const result = SubmitBusinessFormSchema.safeParse(bodyData);

    if (!result.success) {
      console.error('Validation errors:', result.error.issues);
      
      const errors: Record<string, string> = {};
      
      result.error.issues.forEach(issue => {
        let fieldName = 'General';
        
        if (Array.isArray(issue.path) && issue.path.length > 0) {
          const first = issue.path[0];
          if (typeof first === 'string') {
            const map: Record<string, string> = {
              name: 'Business Name',
              description: 'Business Description',
              email: 'Email Address',
              openingTime: 'Opening Time',
              closingTime: 'Closing Time'
            };
            fieldName = map[first] || first;
          }
        }
        
        errors[fieldName] = issue.message;
      });

      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          message: 'Validation failed. Please correct:',
          errors
        },
        { status: 400 }
      );
    }

    const data = result.data as SubmitBusinessFormData;

    // Check operating hours logic
    let timeWarning = '';
    const openTime = data.openingTime?.trim();
    const closeTime = data.closingTime?.trim();
    
    if (openTime && closeTime && openTime !== '' && closeTime !== '') {
      const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (timePattern.test(openTime) && timePattern.test(closeTime)) {
        const openDate = new Date(`2000-01-01T${openTime}:00`);
        const closeDate = new Date(`2000-01-01T${closeTime}:00`);
        
        if (openDate > closeDate) {
          timeWarning = 'Opening time cannot be after closing time';
        }
      }
    }

    // Create business record
    const id = `business_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    const businessRecord = {
      id,
      ...data,
      submittedAt: timestamp,
      status: 'pending_review' as const,
      timeWarning: timeWarning || undefined,
    };

    console.log(`Business "${data.name}" submitted (ID: ${id})`);

    // Simulate database save
    // Save to Convex
    const convex = await getConvexClient();
    const businessInput = {
      name: data.name,
      description: data.description,
      email: data.email,
      openingTime: data.openingTime ?? '',
      closingTime: data.closingTime ?? '',
      phone: (data as any).phone ?? '',
    };
    await convex.mutation(api.submittedBusinesses.addSubmittedBusiness, { business: businessInput });
    console.log('Business submitted to Convex:', businessInput);



    //await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json<ApiSuccessResponse>(
      {
        success: true,
        message: `Thank you, ${data.name}! Your business has been submitted for review.`,
        data: businessRecord
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
    
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      
      error.issues.slice(0, 5).forEach(issue => {
        let field = 'General';
        
        if (Array.isArray(issue.path) && issue.path.length > 0) {
          const [first] = issue.path;
          if (typeof first === 'string') {
            const names: Record<string, string> = {
              name: 'Business Name',
              description: 'Business Description',
              email: 'Email Address',
              openingTime: 'Opening Time',
              closingTime: 'Closing Time'
            };
            field = names[first] || first;
          }
        }
        
        errors[field] = issue.message;
      });
      
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          message: 'Validation errors:',
          errors
        },
        { status: 400 }
      );
    }

    // JSON errors
    if (error instanceof SyntaxError) {
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          message: 'Invalid request format.',
          errors: { Request: 'Could not parse data' }
        },
        { status: 400 }
      );
    }

    // Server error
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: 'Server error. Please try again.',
        errors: {}
      },
      { status: 500 }
    );
  }
}