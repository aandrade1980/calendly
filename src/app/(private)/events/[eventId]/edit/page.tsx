import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';

import EventForm from '@/components/forms/EventForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/drizzle/db';

export const revalidate = 0;

export default async function EditEventPage({
  params: { eventId }
}: {
  params: { eventId: string };
}) {
  const { userId, redirectToSignIn } = auth();

  if (userId == null) return redirectToSignIn();

  const event = await db.query.EventTable.findFirst({
    where: ({ id, clerkUserId }, { and, eq }) =>
      and(eq(clerkUserId, userId), eq(id, eventId))
  });

  console.log({ event });

  if (event == null) return notFound();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Edit Event</CardTitle>
        <CardContent>
          <EventForm
            event={{
              ...event,
              description: event.description || undefined,
              isActive: event.isActive || undefined
            }}
          />
        </CardContent>
      </CardHeader>
    </Card>
  );
}