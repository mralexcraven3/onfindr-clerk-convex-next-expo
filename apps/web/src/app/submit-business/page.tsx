// app/submit-business/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { type SubmitBusinessFormData } from '@/types/submitBusiness';
import SubmitBusinessForm from '@/components/SubmitBusinessForm';

export default function SubmitBusinessPage() {
  const router = useRouter();
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit business information');
      }

      const result = await response.json();
      console.log('Business information submitted:', result);
      
      toast.success('Business information submitted successfully!');
      
      // Optionally redirect or reset form
      // router.push('/submit-business/success');
      
    } catch (error) {
      console.error('Error submitting business information:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit information');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="py-8">
          <SubmitBusinessForm 
            onSubmit={handleSubmit} 
            isLoading={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}