begin;
-- Intentionally additive/no-op. Migration 015 cannot distinguish objects it
-- created from valid objects that already existed before the repair.
commit;
