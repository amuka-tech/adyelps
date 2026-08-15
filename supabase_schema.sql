CREATE TABLE users (
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

-- Helper function to check if the current user is an ADMIN or SUPER_ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
  );
$$;

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

CREATE TABLE obituaries (
        id SERIAL PRIMARY KEY,
        deceased_name VARCHAR(255) NOT NULL,
        biography TEXT,
        photo_url VARCHAR(255),
        funeral_dates_venues TEXT,
        spokesperson_contact VARCHAR(255),
        target_amount DECIMAL(15,2),
        contribution_expiry TIMESTAMP WITH TIME ZONE,
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

CREATE TABLE deduction_rates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        rate_type TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

CREATE TABLE contributions (
        id SERIAL PRIMARY KEY,
        obituary_id INT NOT NULL,
        user_id UUID NOT NULL,
        amount_gross DECIMAL(15,2) NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        verified_by_id UUID NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (obituary_id) REFERENCES obituaries(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (verified_by_id) REFERENCES users(id)
      );

CREATE TABLE disbursements (
        id SERIAL PRIMARY KEY,
        obituary_id INT NOT NULL,
        amount_net DECIMAL(15,2) NOT NULL,
        proof_url VARCHAR(255) NOT NULL,
        disbursed_by_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (obituary_id) REFERENCES obituaries(id),
        FOREIGN KEY (disbursed_by_id) REFERENCES users(id)
      );

CREATE TABLE condolences (
        id SERIAL PRIMARY KEY,
        obituary_id INT NOT NULL,
        user_id UUID NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (obituary_id) REFERENCES obituaries(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

CREATE TABLE jobs (
        id SERIAL PRIMARY KEY,
        posted_by_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        industry VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        job_type TEXT NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT NOT NULL,
        application_link VARCHAR(255),
        offers_referral BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (posted_by_id) REFERENCES users(id)
      );

CREATE TABLE referral_requests (
        id SERIAL PRIMARY KEY,
        job_id INT NOT NULL,
        requester_id UUID NOT NULL,
        poster_id UUID NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id),
        FOREIGN KEY (requester_id) REFERENCES users(id),
        FOREIGN KEY (poster_id) REFERENCES users(id)
      );

CREATE TABLE businesses (
        id SERIAL PRIMARY KEY,
        owner_id UUID NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        website_url VARCHAR(255),
        whatsapp_number VARCHAR(50) NOT NULL,
        offers_alumni_discount BOOLEAN DEFAULT FALSE,
        discount_details VARCHAR(255),
        status TEXT DEFAULT 'PENDING',
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      );

CREATE TABLE events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        event_date TIMESTAMP WITH TIME ZONE NOT NULL,
        location VARCHAR(255) NOT NULL,
        image_url VARCHAR(255),
        status TEXT DEFAULT 'UPCOMING',
        created_by_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by_id) REFERENCES users(id)
      );

CREATE TABLE ticket_tiers (
        id SERIAL PRIMARY KEY,
        event_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        capacity INT NOT NULL,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      );

CREATE TABLE event_registrations (
        id SERIAL PRIMARY KEY,
        event_id INT NOT NULL,
        user_id UUID NOT NULL,
        ticket_tier_id INT NOT NULL,
        dietary_requirements VARCHAR(255),
        special_requirements VARCHAR(255),
        status TEXT DEFAULT 'PAID',
        qr_token VARCHAR(255) UNIQUE NOT NULL,
        is_checked_in BOOLEAN DEFAULT FALSE,
        check_in_time TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (ticket_tier_id) REFERENCES ticket_tiers(id)
      );

CREATE TABLE polls (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        poll_type TEXT NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        created_by_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by_id) REFERENCES users(id)
      );

CREATE TABLE poll_options (
        id SERIAL PRIMARY KEY,
        poll_id INT NOT NULL,
        option_text VARCHAR(255) NOT NULL,
        FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
      );

CREATE TABLE poll_votes (
        id SERIAL PRIMARY KEY,
        poll_id INT NOT NULL,
        user_id UUID NOT NULL,
        poll_option_id INT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (poll_option_id) REFERENCES poll_options(id),
        UNIQUE (poll_id, user_id)
      );

CREATE TABLE documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        doc_type TEXT NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        uploaded_by_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
      );

CREATE TABLE projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        goal_amount DECIMAL(15,2) NOT NULL,
        raised_amount DECIMAL(15,2) DEFAULT 0.00,
        image_url VARCHAR(255),
        deadline TIMESTAMP WITH TIME ZONE,
        status TEXT DEFAULT 'ACTIVE',
        created_by_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by_id) REFERENCES users(id)
      );

CREATE TABLE project_donations (
        id SERIAL PRIMARY KEY,
        project_id INT NOT NULL,
        user_id UUID NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        is_anonymous BOOLEAN DEFAULT FALSE,
        payment_status TEXT DEFAULT 'COMPLETED',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

CREATE TABLE news_articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(255),
        category VARCHAR(100) NOT NULL,
        status TEXT DEFAULT 'DRAFT',
        author_id UUID NOT NULL,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
      );

CREATE TABLE project_updates (
        id SERIAL PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );

CREATE TABLE shop_products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        image_url VARCHAR(255),
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

CREATE TABLE shop_orders (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        total_amount DECIMAL(15,2) NOT NULL,
        status TEXT DEFAULT 'PENDING',
        shipping_address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

CREATE TABLE shop_order_items (
        id SERIAL PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price_at_purchase DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES shop_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES shop_products(id)
      );

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

-- ==========================================
-- ROW LEVEL SECURITY AND POLICIES
-- ==========================================

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE obituaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE deduction_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE condolences ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

-- 2. Admins get full access to everything
CREATE POLICY "Admin full access on users" ON users FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on obituaries" ON obituaries FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on deduction_rates" ON deduction_rates FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on contributions" ON contributions FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on disbursements" ON disbursements FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on condolences" ON condolences FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on jobs" ON jobs FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on referral_requests" ON referral_requests FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on businesses" ON businesses FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on events" ON events FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on ticket_tiers" ON ticket_tiers FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on event_registrations" ON event_registrations FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on polls" ON polls FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on poll_options" ON poll_options FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on poll_votes" ON poll_votes FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on documents" ON documents FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on projects" ON projects FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on project_donations" ON project_donations FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on news_articles" ON news_articles FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on project_updates" ON project_updates FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on shop_products" ON shop_products FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on shop_orders" ON shop_orders FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on shop_order_items" ON shop_order_items FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on roles" ON roles FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on permissions" ON permissions FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on role_permissions" ON role_permissions FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on user_roles" ON user_roles FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on transactions" ON transactions FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on messages" ON messages FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on mentors" ON mentors FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on mentorship_requests" ON mentorship_requests FOR ALL USING (public.is_admin());

-- 3. Public read-only policies (Select for everyone)
CREATE POLICY "Public read access on users" ON users FOR SELECT USING (true);
CREATE POLICY "Public read access on obituaries" ON obituaries FOR SELECT USING (true);
CREATE POLICY "Public read access on deduction_rates" ON deduction_rates FOR SELECT USING (true);
CREATE POLICY "Public read access on jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Public read access on businesses" ON businesses FOR SELECT USING (true);
CREATE POLICY "Public read access on events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read access on ticket_tiers" ON ticket_tiers FOR SELECT USING (true);
CREATE POLICY "Public read access on polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Public read access on poll_options" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Public read access on documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Public read access on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read access on news_articles" ON news_articles FOR SELECT USING (true);
CREATE POLICY "Public read access on project_updates" ON project_updates FOR SELECT USING (true);
CREATE POLICY "Public read access on shop_products" ON shop_products FOR SELECT USING (true);
CREATE POLICY "Public read access on roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Public read access on permissions" ON permissions FOR SELECT USING (true);
CREATE POLICY "Public read access on mentors" ON mentors FOR SELECT USING (true);
CREATE POLICY "Public read access on condolences" ON condolences FOR SELECT USING (true);

-- 4. User-specific access (Select/Insert/Update for owners)
CREATE POLICY "User specific access on users" ON users FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "User specific access on contributions" ON contributions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User specific access on disbursements" ON disbursements FOR ALL USING (auth.uid() = disbursed_by_id) WITH CHECK (auth.uid() = disbursed_by_id);
CREATE POLICY "User specific access on condolences" ON condolences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User specific access on jobs" ON jobs FOR ALL USING (auth.uid() = posted_by_id) WITH CHECK (auth.uid() = posted_by_id);
CREATE POLICY "User specific access on referral_requests" ON referral_requests FOR ALL USING (auth.uid() = requester_id OR auth.uid() = poster_id) WITH CHECK (auth.uid() = requester_id OR auth.uid() = poster_id);
CREATE POLICY "User specific access on businesses" ON businesses FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "User specific access on events" ON events FOR ALL USING (auth.uid() = created_by_id) WITH CHECK (auth.uid() = created_by_id);
CREATE POLICY "User specific access on event_registrations" ON event_registrations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User specific access on polls" ON polls FOR ALL USING (auth.uid() = created_by_id) WITH CHECK (auth.uid() = created_by_id);
CREATE POLICY "User specific access on poll_votes" ON poll_votes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User specific access on documents" ON documents FOR ALL USING (auth.uid() = uploaded_by_id) WITH CHECK (auth.uid() = uploaded_by_id);
CREATE POLICY "User specific access on projects" ON projects FOR ALL USING (auth.uid() = created_by_id) WITH CHECK (auth.uid() = created_by_id);
CREATE POLICY "User specific access on project_donations" ON project_donations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User specific access on news_articles" ON news_articles FOR ALL USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "User specific access on shop_orders" ON shop_orders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- shop_order_items (via join on shop_orders)
CREATE POLICY "User specific access on shop_order_items" ON shop_order_items FOR ALL 
USING (EXISTS (SELECT 1 FROM shop_orders WHERE shop_orders.id = shop_order_items.order_id AND shop_orders.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM shop_orders WHERE shop_orders.id = shop_order_items.order_id AND shop_orders.user_id = auth.uid()));

CREATE POLICY "User specific access on user_roles" ON user_roles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User specific access on transactions" ON transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User specific access on messages" ON messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id) WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "User specific access on mentors" ON mentors FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- mentorship_requests (mentee_id or via mentors table)
CREATE POLICY "User specific access on mentorship_requests" ON mentorship_requests FOR ALL 
USING (auth.uid() = mentee_id OR EXISTS (SELECT 1 FROM mentors WHERE mentors.id = mentorship_requests.mentor_id AND mentors.user_id = auth.uid()))
WITH CHECK (auth.uid() = mentee_id OR EXISTS (SELECT 1 FROM mentors WHERE mentors.id = mentorship_requests.mentor_id AND mentors.user_id = auth.uid()));
