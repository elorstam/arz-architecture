begin;

-- The repair is intentionally non-destructive. Dropping or restoring the
-- broken initializer would reintroduce the 42P10 failure and could remove the
-- only callable initializer in an already-partial environment.
notify pgrst, 'reload schema';
commit;
