-- characters 테이블
create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  character_name text not null unique,
  server_name text,
  class_name text,
  item_avg_level numeric,
  ark_passive_pattern text,
  profile jsonb,
  equipment jsonb,
  engravings jsonb,
  gems jsonb,
  skills jsonb,
  updated_at timestamptz not null default now()
);

-- 업데이트 시 updated_at 자동 갱신
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger characters_updated_at
  before update on characters
  for each row execute function update_updated_at();

-- 통계 집계 뷰
create or replace view character_stats as
select
  class_name,
  ark_passive_pattern,
  count(*) as count,
  round(avg(item_avg_level)::numeric, 2) as avg_item_level
from characters
where ark_passive_pattern is not null
group by class_name, ark_passive_pattern
order by class_name, count desc;
