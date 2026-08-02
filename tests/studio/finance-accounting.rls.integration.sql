begin;
-- Run manually with authenticated Organization A owner/member, Organization B owner and anon claims.
-- Owner A: INSERT/UPDATE entries and payments succeeds. Member A: SELECT succeeds, mutation fails.
-- Organization B and anon cannot read or mutate Organization A finance records.
-- Payment over income, cross-project receipt and cross-organization references fail with 23514.
-- DELETE remains unavailable for every authenticated role.
rollback;
