begin;
-- Run manually in a disposable Supabase test database after migration 014.
-- Matrix: organization A owner CRUD; A member SELECT only; organization B and anon no access.
-- Verify document FKs reject cross-project/cross-organization logical files.
-- Verify document_received without received_document_file_id fails with 23514.
-- Verify studio_initialize_project_obligations called twice leaves exactly eight default rows.
-- Verify no DELETE grant or policy exists for obligations, events, or notifications.
rollback;
