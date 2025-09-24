// app/api/submit-business/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { type SubmitBusinessFormData, SubmitBusinessFormSchema } from '@/types/submitBusiness';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate with Zod (will only validate present fields)
    const validatedData: SubmitBusinessFormData = SubmitBusinessFormSchema.parse(body);
    
    // Additional business logic validation for optional time fields
    let timeWarning = '';
    if (validatedData.openingTime && validatedData.closingTime) {
      const openingTime = new Date(`2000-01-01T${validatedData.openingTime}:00`);
      const closingTime = new Date(`2000-01-01T${validatedData.closingTime}:00`);
      
      if (openingTime >= closingTime) {
        timeWarning = 'Note: Opening time appears to be after or equal to closing time.';
      }
    }

    // Format phone number for consistency (only if provided)
    const formatUKPhone = (phone?: string): string => {
      if (!phone || phone.trim() === '') return '';
      
      // Remove all non-digit characters and normalize spaces
      let cleaned = phone.replace(/[^\d+]/g, '');
      
      // Handle UK mobile numbers (07xxx -> +447xxx)
      if (cleaned.startsWith('07')) {
        cleaned = '+44' + cleaned.substring(1);
      } 
      // Handle international format without +44 (44xxx -> +44xxx)
      else if (cleaned.startsWith('44') && cleaned.length > 10) {
        cleaned = '+' + cleaned;
      }
      // Handle 10-digit UK numbers starting with 7 (mobile)
      else if (cleaned.length === 10 && cleaned.startsWith('7')) {
        cleaned = '+447' + cleaned.substring(1);
      }
      // Add +44 to UK numbers that don't have country code (10 digits starting with non-0)
      else if (cleaned.length === 10 && !cleaned.startsWith('0')) {
        cleaned = '+44' + cleaned;
      }
      
      return cleaned;
    };

    // Format website to include protocol and www if needed (only if provided)
    const formatWebsite = (website?: string): string => {
      if (!website || website.trim() === '') return '';
      
      let domain = website.toLowerCase().trim();
      
      // If it already has a protocol, return as-is
      if (domain.startsWith('http://') || domain.startsWith('https://')) {
        return domain;
      }
      
      // Add www if it's a simple domain and doesn't have subdomain
      if (!domain.startsWith('www.') && !domain.match(/^[^.]+\.(com|co\.uk|org|net)$/i)) {
        domain = 'www.' + domain;
      }
      
      // Add https if no protocol
      domain = 'https://' + domain;
      
      return domain;
    };

    const formattedData = {
      ...validatedData,
      phone: formatUKPhone(validatedData.phone),
      website: formatWebsite(validatedData.website),
    } as SubmitBusinessFormData;

    console.log('Received business submission:', formattedData);

    // Simulate processing (e.g., database save, email notification)
    await new Promise(resolve => setTimeout(resolve, 800));

    const savedBusiness: SubmitBusinessFormData & { 
      id: string; 
      submittedAt: string; 
      status: string; 
      timeWarning?: string;
    } = {
      id: `business_${Date.now()}`,
      ...formattedData,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      ...(timeWarning && { timeWarning }),
    };

    return NextResponse.json(
      { 
        success: true, 
        message: 'Business information submitted successfully!',
        data: savedBusiness 
      },
      { status: 201 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      
      // Transform Zod errors to a more user-friendly format
      const fieldErrors = error.errors.reduce((acc, err) => {
        // Get the most relevant error message (Zod returns multiple errors for chained validations)
        const pathStr = Array.isArray(err.path) ? err.path.join('.') : err.path;
        acc[pathStr] = err.message;
        return acc;
      }, {} as Record<string, string>);

      return NextResponse.json(
        { 
          success: false, 
          message: 'Please correct the validation errors',
          errors: fieldErrors
        },
        { status: 400 }
      );
    }

    console.error('Error processing business submission:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to submit information' 
      },
      { status: 500 }
    );
  }
}