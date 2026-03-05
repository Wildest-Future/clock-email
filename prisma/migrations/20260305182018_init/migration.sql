-- CreateEnum
CREATE TYPE "ClockStatus" AS ENUM ('active', 'response_received', 'disputed', 'resolved', 'inactive');

-- CreateEnum
CREATE TYPE "DepartmentLevel" AS ENUM ('city_council', 'mayor', 'department', 'agency');

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "level" "DepartmentLevel" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "officials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "office" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "district" TEXT,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "officials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "official_emails" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "official_id" TEXT NOT NULL,

    CONSTRAINT "official_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "identifier" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "created_by_email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "campaign_targets" (
    "campaign_identifier" TEXT NOT NULL,
    "official_id" TEXT NOT NULL,

    CONSTRAINT "campaign_targets_pkey" PRIMARY KEY ("campaign_identifier","official_id")
);

-- CreateTable
CREATE TABLE "clocks" (
    "id" TEXT NOT NULL,
    "sender_email" TEXT NOT NULL,
    "sender_display_name" TEXT,
    "recipient_email" TEXT NOT NULL,
    "official_id" TEXT,
    "campaign_identifier" TEXT,
    "subject_line" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "resolution_backdated_to" TIMESTAMP(3),
    "status" "ClockStatus" NOT NULL DEFAULT 'active',
    "check_in_token" TEXT NOT NULL,
    "last_check_in_sent" TIMESTAMP(3),
    "message_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_events" (
    "id" TEXT NOT NULL,
    "clock_id" TEXT NOT NULL,
    "status" "ClockStatus" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "government_resolution_requests" (
    "id" TEXT NOT NULL,
    "clock_id" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimed_response_date" TIMESTAMP(3) NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "government_resolution_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unrecognized_emails" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "unrecognized_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_slug_key" ON "departments"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "officials_slug_key" ON "officials"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "official_emails_email_key" ON "official_emails"("email");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_slug_code_key" ON "campaigns"("slug", "code");

-- CreateIndex
CREATE UNIQUE INDEX "clocks_check_in_token_key" ON "clocks"("check_in_token");

-- CreateIndex
CREATE UNIQUE INDEX "clocks_message_id_key" ON "clocks"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "government_resolution_requests_clock_id_key" ON "government_resolution_requests"("clock_id");

-- CreateIndex
CREATE UNIQUE INDEX "unrecognized_emails_email_key" ON "unrecognized_emails"("email");

-- AddForeignKey
ALTER TABLE "officials" ADD CONSTRAINT "officials_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "official_emails" ADD CONSTRAINT "official_emails_official_id_fkey" FOREIGN KEY ("official_id") REFERENCES "officials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_targets" ADD CONSTRAINT "campaign_targets_campaign_identifier_fkey" FOREIGN KEY ("campaign_identifier") REFERENCES "campaigns"("identifier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_targets" ADD CONSTRAINT "campaign_targets_official_id_fkey" FOREIGN KEY ("official_id") REFERENCES "officials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clocks" ADD CONSTRAINT "clocks_official_id_fkey" FOREIGN KEY ("official_id") REFERENCES "officials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clocks" ADD CONSTRAINT "clocks_campaign_identifier_fkey" FOREIGN KEY ("campaign_identifier") REFERENCES "campaigns"("identifier") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_events" ADD CONSTRAINT "status_events_clock_id_fkey" FOREIGN KEY ("clock_id") REFERENCES "clocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "government_resolution_requests" ADD CONSTRAINT "government_resolution_requests_clock_id_fkey" FOREIGN KEY ("clock_id") REFERENCES "clocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
