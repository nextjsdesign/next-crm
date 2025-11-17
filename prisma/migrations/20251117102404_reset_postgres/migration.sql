-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "logoUrl" TEXT,
    "tabStyle" TEXT NOT NULL DEFAULT 'classic',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
