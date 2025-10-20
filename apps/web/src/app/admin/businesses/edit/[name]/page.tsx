// Admin dashboard for editing business using the name as the id

'use client';

import { api } from "@onfindr-clerk-convex-next-expo/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { EditBusinessForm } from "@/components/EditBusinessForm";

export default function EditBusiness() {
	const businesses = useQuery(api.business.getBusinesses);
    
    // convert name to slug
    
    const { name } = useParams<{ name: string }>();
    const slug = name?.replace(/ /g, '-');
    console.log(slug);
    const business = businesses?.find((business) => business.slug === slug);
    console.log(business);
	return (
    <>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1>Edit Business {business?.name}</h1>
        <div className="">
            <EditBusinessForm 
                name={business?.name}
                description={business?.description ?? undefined}
                email={business?.email ?? undefined}
            />
            <div>
                <h1>{business?.name}</h1>
                <p>{business?.description}</p>
                
            </div>
        </div>
       </div>
    </>
	)


}