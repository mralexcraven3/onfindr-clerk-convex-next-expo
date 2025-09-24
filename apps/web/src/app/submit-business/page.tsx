// app/submit-business/page.tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { type SubmitBusinessFormData } from '@/types/submitBusiness';
import SubmitBusinessForm from '@/components/SubmitBusinessForm';

export default function SubmitBusinessPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: SubmitBusinessFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.errors 
          ? Object.values(result.errors).join('; ') 
          : result.message || 'Failed to submit business information';
        throw new Error(errorMessage);
      }

      console.log('Business submitted:', result.data);
      toast.success(result.message || 'Business submitted successfully!');
      
      // Optional: Reset form or redirect
      // form.reset();
      
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Submission failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <SubmitBusinessForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>
      </div>
    </div>
  );
}