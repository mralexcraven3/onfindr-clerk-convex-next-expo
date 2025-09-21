"use client";

import { api } from "@onfindr-clerk-convex-next-expo/backend/convex/_generated/api";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useQuery,
} from "convex/react";

export default function UserAdmin() {
	const user = useUser();

	const businessesConvex = useQuery(api.business.getBusinesses);

	return (
		<>
			<div className="">
							<h1>Businessses</h1>
			
							{businessesConvex?.map((business) => (
									<ul key={business._id}>

									
											<li
												key={business._id}
												className=""
											>
													<p>
														{business.name}
													</p>
											</li>
										</ul>
									))}
					</div>
		</>
	);
}
