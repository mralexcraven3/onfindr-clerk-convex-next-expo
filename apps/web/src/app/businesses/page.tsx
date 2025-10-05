"use client";

import { api } from "@onfindr-clerk-convex-next-expo/backend/convex/_generated/api";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useQuery,
} from "convex/react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function UserAdmin() {
	const user = useUser();

	const businessesConvex = useQuery(api.business.getBusinesses);
	
	// Return businesses as cards
	// const businessesCards = businessesConvex?.map((business) => (
	// 	<Card key={business._id}>
	// 		<CardHeader>
	// 			<CardTitle>{business.name}</CardTitle>
	// 		</CardHeader>
	// 	</Card>
	// ));


	return (
		<>
			<div className="">
							<h1>Businessses</h1>
			
							{businessesConvex?.map((business) => (
									<Card key={business._id}>											
													<CardHeader>
														{business.name}
													</CardHeader>
													<CardDescription>	
														{business.description}
													</CardDescription>
													<CardFooter>
														<Button>View</Button>
													</CardFooter>
										</Card>
									))}
					</div>
		</>
	);
}
