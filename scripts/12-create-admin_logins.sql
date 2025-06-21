CREATE TABLE admin_logins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  ip_address text,
  user_agent text,
  latitude double precision,
  longitude double precision,
  created_at timestamp with time zone DEFAULT now()
);
