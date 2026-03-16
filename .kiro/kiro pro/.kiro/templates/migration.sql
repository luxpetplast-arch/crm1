-- Migration: {{MigrationName}}
-- Created: {{Date}}
-- Description: {{Description}}

-- ============================================
-- UP Migration
-- ============================================

BEGIN;

-- Add your migration here
{{MigrationSQL}}

COMMIT;

-- ============================================
-- DOWN Migration (Rollback)
-- ============================================

BEGIN;

-- Add rollback here
{{RollbackSQL}}

COMMIT;

-- ============================================
-- Verification Queries
-- ============================================

-- Verify migration success
{{VerificationSQL}}
