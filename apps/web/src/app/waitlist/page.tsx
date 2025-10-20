import { submitWaitlist } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WaitlistPage() {
  return (
    <div className="mx-auto max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>Join the Waitlist</CardTitle>
          <CardDescription>Get notified when we launch.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitWaitlist} className="grid gap-4">
            <Input name="email" type="email" placeholder="you@example.com" required />
            <div className="flex items-center gap-2">
              <Button type="submit" className="w-full">Notify me</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


