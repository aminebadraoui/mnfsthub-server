import { pgTable, uuid, varchar, timestamp, integer, text, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    password: varchar('password', { length: 256 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const lists = pgTable('lists', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: text('description'),
    tags: jsonb('tags').default([]),
    tenantId: uuid('tenant_id').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const campaigns = pgTable('campaigns', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 64 }).notNull(),
    channels: jsonb('channels').default([]),
    listId: uuid('list_id').references(() => lists.id),
    tenantId: uuid('tenant_id').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const contacts = pgTable('contacts', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => users.id).notNull(),
    fullName: varchar('full_name', { length: 256 }).notNull(),
    firstName: varchar('first_name', { length: 128 }),
    lastName: varchar('last_name', { length: 128 }),
    location: varchar('location', { length: 256 }),
    jobTitle: varchar('job_title', { length: 256 }),
    company: varchar('company', { length: 256 }),
    email: varchar('email', { length: 256 }),
    phone: varchar('phone', { length: 64 }),
    linkedin: varchar('linkedin', { length: 256 }),
    facebook: varchar('facebook', { length: 256 }),
    twitter: varchar('twitter', { length: 256 }),
    instagram: varchar('instagram', { length: 256 }),
    whatsapp: varchar('whatsapp', { length: 64 }),
    tiktok: varchar('tiktok', { length: 256 }),
    employeeNumber: varchar('employee_number', { length: 64 }),
    industry: varchar('industry', { length: 256 }),
    listName: varchar('list_name', { length: 256 }),
    listId: uuid('list_id').references(() => lists.id),
    campaigns: jsonb('campaigns').default([]),
    lastCampaign: uuid('last_campaign').references(() => campaigns.id),
    contactChannels: jsonb('contact_channels').default([]),
    lastContactChannel: varchar('last_contact_channel', { length: 64 }),
    lastContactedAt: timestamp('last_contacted_at'),
    availableChannels: jsonb('available_channels').default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
}); 