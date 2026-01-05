import { integer, pgTable, json,varchar, timestamp, boolean } from "drizzle-orm/pg-core";
export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({length: 255}).notNull(),
    isPro: boolean(),

    email: varchar({length: 255}).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    credits: integer().default(1),
    createdAt: varchar(),
    avatarUrl: varchar()
});


export const workflowsTable = pgTable("workflows", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    workflowId: varchar().notNull().unique(),
    name: varchar({length: 255}).notNull(),
    createdBy: varchar().references(() => usersTable.email),
    createdAt: varchar(),
    updatedAt: varchar(),

});

export const nodesTable = pgTable("nodes", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    workflowId: varchar().references(() => workflowsTable.workflowId),
    nodeId: varchar().notNull(),

    type: varchar().notNull(),
    position: json(),
    data: json(),

    credentialId: varchar().references(() => credentialTable.credentialId),

    createdAt: varchar(),
    updatedAt: varchar(),
});

export const connectionsTable = pgTable("connections", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    workflowId: varchar().references(() => workflowsTable.workflowId),
    fromNodeId: varchar(),
    toNodeId: varchar(),
    fromOutput: varchar(),
    toInput: varchar()
});

export const credentialTable = pgTable('credentials', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    credentialId: varchar().notNull().unique(), // публичный id
    name: varchar().notNull(),
    type: varchar().notNull(),


    value: varchar(),
    createdBy: varchar().references(() => usersTable.email),

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export const executionTable = pgTable('executions', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    executionId: varchar().notNull().unique(),
    name: varchar(),
    completedAt: timestamp("completed_at", { withTimezone: true })
        .defaultNow(),

    startedAt: timestamp("started_at", { withTimezone: true })
        .defaultNow(),


    createdBy: varchar().references(() => usersTable.email),
    workflowId: varchar().references(() => workflowsTable.workflowId),
    inngestEventId: varchar().notNull().unique(),
    output: json(),
    status: varchar().default('running'),
    error: varchar(),
    errorStack: varchar()
})