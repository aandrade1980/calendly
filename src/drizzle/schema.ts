import { DAYS_OF_WEEK_IN_ORDER } from '@/data/constants';
import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core';

export const scheduleDayOfWeekEnum = pgEnum(
  'schedule_day_of_week',
  DAYS_OF_WEEK_IN_ORDER
);

const createdAt = timestamp('created_at').notNull().defaultNow();
const updateAt = timestamp('updated_at')
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());

export const EventTable = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    durationInMinutes: integer('duration_in_minutes').notNull(),
    clerkUserId: text('clerk_user_id').notNull(),
    isActive: boolean('is_active').default(true),
    createdAt,
    updateAt
  },
  table => ({
    clerkUserIdIndex: index('clerk_user_id_index').on(table.clerkUserId)
  })
);

export const ScheduleTable = pgTable('schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  timezone: text('timezone').notNull(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  createdAt,
  updateAt
});

export const ScheduleRelations = relations(ScheduleTable, ({ many }) => ({
  availabilities: many(ScheduleAvailabilityTable)
}));

export const ScheduleAvailabilityTable = pgTable(
  'schedule_availabilities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scheduleId: uuid('schedule_id')
      .notNull()
      .references(() => ScheduleTable.id, { onDelete: 'cascade' }),
    startTime: text('start_time').notNull(),
    endTime: text('end_time').notNull(),
    dayOfWeek: scheduleDayOfWeekEnum('day_of_week').notNull()
  },
  table => ({
    scheduleIdIndex: index('schedule_id_index').on(table.scheduleId)
  })
);

export const ScheduleAvailabilityRelations = relations(
  ScheduleAvailabilityTable,
  ({ one }) => ({
    schedule: one(ScheduleTable, {
      fields: [ScheduleAvailabilityTable.scheduleId],
      references: [ScheduleTable.id]
    })
  })
);
