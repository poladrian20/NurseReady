CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `study` (
	`user` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
