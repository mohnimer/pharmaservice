-- Activate after verified frontend deployment (PR #19; production 846de0ce).
alter table public.orders enable trigger commercial_release_gate;
