-- CreateEnum
CREATE TYPE "ClockStatus" AS ENUM ('active', 'response_received', 'disputed', 'resolved', 'inactive');

-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('approved', 'blocked', 'pending');

-- CreateTable
CREATE TABLE "campaigns" (
    "identifier" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "email_template" TEXT,
    "suggested_subject" TEXT,
    "created_by_email" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "campaign_targets" (
    "id" TEXT NOT NULL,
    "campaign_identifier" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "campaign_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clocks" (
    "id" TEXT NOT NULL,
    "sender_email" TEXT NOT NULL,
    "sender_display_name" TEXT,
    "recipient_email" TEXT NOT NULL,
    "campaign_identifier" TEXT NOT NULL,
    "subject_line" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "resolution_backdated_to" TIMESTAMP(3),
    "status" "ClockStatus" NOT NULL DEFAULT 'active',
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "hidden_reason" TEXT,
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
CREATE TABLE "domains" (
    "domain" TEXT NOT NULL,
    "status" "DomainStatus" NOT NULL DEFAULT 'pending',
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "reason" TEXT,
    "submitted_by" TEXT,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("domain")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_slug_code_key" ON "campaigns"("slug", "code");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_targets_campaign_identifier_email_key" ON "campaign_targets"("campaign_identifier", "email");

-- CreateIndex
CREATE UNIQUE INDEX "clocks_check_in_token_key" ON "clocks"("check_in_token");

-- CreateIndex
CREATE UNIQUE INDEX "clocks_message_id_key" ON "clocks"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "government_resolution_requests_clock_id_key" ON "government_resolution_requests"("clock_id");

-- AddForeignKey
ALTER TABLE "campaign_targets" ADD CONSTRAINT "campaign_targets_campaign_identifier_fkey" FOREIGN KEY ("campaign_identifier") REFERENCES "campaigns"("identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clocks" ADD CONSTRAINT "clocks_campaign_identifier_fkey" FOREIGN KEY ("campaign_identifier") REFERENCES "campaigns"("identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_events" ADD CONSTRAINT "status_events_clock_id_fkey" FOREIGN KEY ("clock_id") REFERENCES "clocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "government_resolution_requests" ADD CONSTRAINT "government_resolution_requests_clock_id_fkey" FOREIGN KEY ("clock_id") REFERENCES "clocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
