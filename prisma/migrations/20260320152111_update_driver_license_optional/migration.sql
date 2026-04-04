-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "vehicleNumber" TEXT NOT NULL,
    "telegramChatId" TEXT,
    "telegramUsername" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "rating" REAL NOT NULL DEFAULT 5.0,
    "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "currentLocation" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Driver" ("active", "createdAt", "currentLocation", "id", "licenseNumber", "name", "notes", "phone", "rating", "status", "telegramChatId", "telegramUsername", "totalDeliveries", "updatedAt", "userId", "vehicleNumber") SELECT "active", "createdAt", "currentLocation", "id", "licenseNumber", "name", "notes", "phone", "rating", "status", "telegramChatId", "telegramUsername", "totalDeliveries", "updatedAt", "userId", "vehicleNumber" FROM "Driver";
DROP TABLE "Driver";
ALTER TABLE "new_Driver" RENAME TO "Driver";
CREATE UNIQUE INDEX "Driver_phone_key" ON "Driver"("phone");
CREATE UNIQUE INDEX "Driver_telegramChatId_key" ON "Driver"("telegramChatId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
