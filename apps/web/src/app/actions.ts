'use server'
import { getConvexClient } from '@/lib/convex';
import { api } from '@onfindr-clerk-convex-next-expo/backend/convex/_generated/api'
import { type EditBusinessFormValues, type SubmitBusinessFormValues } from '@/lib/schema'

export async function SubmitBusiness(data: SubmitBusinessFormValues) {
    console.log(data);


    // add to convex
    const convex = await getConvexClient();
    await convex.mutation(api.submittedBusinesses.addSubmittedBusiness, { business: data })
    

    return {
        message: 'Business submitted successfully',
        data: {
            name: data.name,
            email: data.email,
            description: data.description
        },
        status: 'success'
    }
}

export async function EditBusiness(data: EditBusinessFormValues) {
    console.log(data);

    // add to convex
    const convex = await getConvexClient();
    const slug = data.name.trim().toLowerCase().replace(/\s+/g, '-');
    await convex.mutation(api.business.updateBusiness, { business: { ...data, slug } })

    return {
        message: 'Business edited successfully',
        data: {
            name: data.name,
            email: data.email,
            description: data.description
        },
        status: 'success'
    }
}   