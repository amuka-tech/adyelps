const fs = require('fs');

let schema = fs.readFileSync('schema.txt', 'utf8');

// Replacements for PostgreSQL
schema = schema.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY');
schema = schema.replace(/DATETIME/g, 'TIMESTAMP WITH TIME ZONE');
schema = schema.replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP');
schema = schema.replace(/LONGTEXT/g, 'TEXT');
schema = schema.replace(/CREATE TABLE sqlite_sequence\(name,seq\)/g, '');

// Supabase Auth integration for users table
// We need to link the users table to auth.users
schema = schema.replace(
  /CREATE TABLE users \([\s\S]*?\)/,
  `CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  class_year VARCHAR(10),
  profession VARCHAR(100),
  phone VARCHAR(20),
  role TEXT DEFAULT 'MEMBER',
  hide_contact_info BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to automatically create a user profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, first_name, last_name, email, class_year, profession, phone, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'firstName', 
    new.raw_user_meta_data->>'lastName', 
    new.email,
    new.raw_user_meta_data->>'classYear',
    new.raw_user_meta_data->>'profession',
    new.raw_user_meta_data->>'phone',
    'MEMBER'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`
);

// We need to change all INT foreign keys to referencing users(id) to UUID
schema = schema.replace(/user_id INT/g, 'user_id UUID');
schema = schema.replace(/created_by_id INT/g, 'created_by_id UUID');
schema = schema.replace(/verified_by_id INT/g, 'verified_by_id UUID');
schema = schema.replace(/disbursed_by_id INT/g, 'disbursed_by_id UUID');
schema = schema.replace(/posted_by_id INT/g, 'posted_by_id UUID');
schema = schema.replace(/requester_id INT/g, 'requester_id UUID');
schema = schema.replace(/poster_id INT/g, 'poster_id UUID');
schema = schema.replace(/owner_id INT/g, 'owner_id UUID');
schema = schema.replace(/uploaded_by_id INT/g, 'uploaded_by_id UUID');
schema = schema.replace(/author_id INT/g, 'author_id UUID');

// Also the SQLite schema is missing 'transactions', 'messages', 'permissions', 'roles', 'mentorship_requests', 'mentors' which were added later!
// I'll append them.

schema += `
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE role_permissions (
  role_id INT REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id INT REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(15,2) NOT NULL,
  transaction_type TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mentors (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  expertise TEXT NOT NULL,
  bio TEXT,
  max_mentees INT DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mentorship_requests (
  id SERIAL PRIMARY KEY,
  mentor_id INT NOT NULL REFERENCES mentors(id),
  mentee_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

fs.writeFileSync('supabase_schema.sql', schema);
console.log('Done generating supabase_schema.sql');
