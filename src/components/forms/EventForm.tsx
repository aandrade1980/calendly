'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { eventFormSchema } from '@/schema/events';
import { createEvent, deleteEvent, updateEvent } from '@/server/actions/events';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

export default function EventForm({
  event
}: {
  event?: {
    id: string;
    name: string;
    description: string | undefined;
    isActive: boolean | undefined;
    durationInMinutes: number;
    clerkUserId: string;
  };
}) {
  const [isDeletePending, startDeleteTransition] = useTransition();

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event ?? {
      isActive: true,
      durationInMinutes: 30
    }
  });

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    const action =
      event == null ? createEvent : updateEvent.bind(null, event.id);

    const response = await action(values);

    if (response?.error) {
      form.setError('root', { message: 'Something went wrong' });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col"
      >
        {form.formState.errors.root ? (
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        ) : null}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The name users will see when booking
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="durationInMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>In minutes</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea className="resize-none h-32" {...field} />
              </FormControl>
              <FormDescription>
                Optional description of the event
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormLabel>Active</FormLabel>
              <FormDescription>
                Inactive events will not be visible to users to book
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 justify-end">
          {event ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructiveGhost"
                  disabled={form.formState.isSubmitting}
                >
                  Delete
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete this event?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the event
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={isDeletePending}
                    onClick={() => {
                      startDeleteTransition(async () => {
                        const response = await deleteEvent(event.id);

                        if (response.error) {
                          form.setError('root', {
                            message: 'Something went wrong deleting your event'
                          });
                        }
                      });
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          <Button type="button" asChild variant="outline">
            <Link href="/events">Cancel</Link>
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
