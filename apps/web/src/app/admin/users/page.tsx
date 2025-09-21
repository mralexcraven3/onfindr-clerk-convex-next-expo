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
	const privateData = useQuery(api.privateData.get);


	const usersConvex = useQuery(api.user.getUsers);

	return (
		<>
        <div className="">

        
			<Authenticated>
				<div>
					<h1>Dashboard</h1>
					<p>Welcome {user.user?.fullName}</p>
					<p>privateData: {privateData?.message}</p>
					<UserButton />
				</div>
			</Authenticated>
			<Unauthenticated>
				<SignInButton />
			</Unauthenticated>
			<AuthLoading>
				<div>Loading...</div>
			</AuthLoading>

			<div className="">
							<h1>User Admin</h1>
			
							{usersConvex?.map((user) => (
									<ul key={user._id}>

									
											<li
												key={user._id}
												className=""
											>
													<p>
														{user.fullname}
													</p>
											</li>
										</ul>
									))}
					</div>
        
        </div>
		</>
	);
}
