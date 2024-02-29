CREATE TABLE public.fixtures (
    id BIGSERIAL NOT NULL,
    fixture_id BIGINT,
    date TEXT,
    time TEXT,
    status TEXT,
    home TEXT,
    away TEXT,
    venue TEXT,
    home_id BIGINT,
    away_id BIGINT,
    home_score BIGINT,
    away_score TEXT,
    CONSTRAINT fixtures_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;
