// Admin dashboard for businesses
'use client';
import { api } from "@onfindr-clerk-convex-next-expo/backend/convex/_generated/api";
import { useQuery } from "convex/react";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"


export default function Businesses() {
	const businesses = useQuery(api.business.getBusinesses);
    console.log(businesses);

    // Show the businesses in a table
    const businessesTable = businesses?.map((business) => (
        <TableRow key={business._id}>
            <td className="border px-4 py-2">{business.name}</td>
            <td className="border px-4 py-2">{business.description}</td>
            <td className="border px-4 py-2">{business.email}</td>
        </TableRow>
    ));

	return(
        <>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1>Businesses</h1>
        <Table className="table-auto">
            <TableHeader>
                <TableRow>
                    <th className="border px-4 py-2">Name</th>
                    <th className="border px-4 py-2">Description</th>
                    <th className="border px-4 py-2">Email</th>
                </TableRow>
                </TableHeader>
            <TableBody>
                {businessesTable}
            </TableBody>
        </Table>
        </div>
        
        </>
    );
}