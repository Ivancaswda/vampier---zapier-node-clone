import { integer, pgTable, json,varchar, timestamp, boolean } from "drizzle-orm/pg-core";
export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userName: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    avatarUrl: varchar(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});


export const coursesTable = pgTable('courses', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    cid: varchar().notNull(),
    name: varchar(),
    description: varchar(),
    noOfChapters: integer().notNull(),
    includeVideo: boolean().default(false),
    label: varchar().notNull(),
    category: varchar(),
    courseJson: json(),
    courseContent: json().default({}),
    bannerImageUrl: varchar().default(''),
    userEmail: varchar('userEmail').references(() => usersTable.email).notNull(), // conntected to our user table`s email
    createdAt: timestamp("created_at").defaultNow().notNull()
})

export const enrolledCourseTable = pgTable('enrolledCourse', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    cid: varchar('cid').references(() => coursesTable.cid).notNull(), // conntected to our course table`s course id
    userEmail: varchar('userEmail').references(() => usersTable.email).notNull(), // conntected to our user table`s email
    completedChapters: json(),
    homeworks: json().default({}),
    materials: json().default({}),
    practiceTasks: json().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull()
})


export const badgesTable = pgTable("badges", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    code: varchar({ length: 255 }).notNull().unique(), // например "3_courses", "10_homeworks"
    title: varchar({ length: 255 }).notNull(), // Название медали
    description: varchar({ length: 500 }), // Описание
    iconUrl: varchar(), // путь к иконке/медали
    createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const userBadgesTable = pgTable("user_badges", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userEmail: varchar("userEmail").references(() => usersTable.email).notNull(),
    badgeId: integer().references(() => badgesTable.id).notNull(),
    earnedAt: timestamp("earned_at").defaultNow().notNull(),
});