# Adyel Alumni Platform

The Adyel Alumni Platform is a comprehensive, enterprise-grade social and administrative web application built specifically for the Adyel High School Alumni community.

Built entirely with **Next.js**, **React 19**, **Tailwind CSS**, and **MySQL**, it functions as a single source of truth for connecting past students, managing community funds, generating revenue, and fostering professional mentorships.

## 🌟 Key Features

1. **Social Network & Directory**
   - Nostalgic news feed and global directory for alumni to reconnect.
   - Real-time Direct Messaging.
   - Comprehensive User Profiles with notification preferences.

2. **Welfare & Treasury**
   - Transparent Welfare Ledger for viewing incoming contributions.
   - Immutable Audit Trails to ensure financial accountability.
   - Obituary and Condolence Boards.

3. **Commerce & Jobs**
   - E-commerce Marketplace (Adyel Shop) with integrated payment gateways (Paystack, Flutterwave, Mobile Money).
   - Career Hub for posting and applying to exclusive jobs.
   - Business Directory to promote alumni ventures.

4. **Mentorship Hub**
   - Intelligent matchmaking algorithm connecting young alumni with experienced mentors in their industry.
   - Active tracking of mentorship goals and requests.

5. **Super Admin Dashboard**
   - Unified administrative portal.
   - Real-time Financial and Engagement Analytics.
   - Complex data grid for user role assignments and content moderation.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- MySQL (v8.0+)
- XAMPP / MAMP (Optional, for easy MySQL local hosting)

### 2. Setup the Database
Create a MySQL database named \`adyeldb\`.
Run all the migration scripts located in the \`scripts/\` directory to build the schema:
\`\`\`bash
node scripts/setup_db.js
node scripts/seed_users.js
node scripts/add_mentorship_tables.js
# ... run any other relevant scripts sequentially to seed data
\`\`\`

### 3. Environment Variables
Copy the `.env.example` file to `.env.local`:
\`\`\`bash
cp .env.example .env.local
\`\`\`
Edit `.env.local` to match your local database credentials and JWT secrets.

### 4. Install & Run
\`\`\`bash
npm install
npm run dev
\`\`\`
The platform will be live at `http://localhost:3000`.

---

## 🐳 Production Deployment (Docker)

For seamless deployment to an Ubuntu VPS, AWS EC2, or DigitalOcean Droplet, we provide Docker configuration out of the box.

### 1. Prerequisites
- Docker & Docker Compose installed on your server.

### 2. Deploy
Update the environment variables in `docker-compose.yml` with your production secrets (Strong passwords, real Payment API keys, SMTP credentials).

Run the containers:
\`\`\`bash
docker-compose up -d --build
\`\`\`

This will spin up both the Next.js application (optimized standalone build) and a MySQL 8.0 database container. The application will be accessible on port 3000.

---

## 🛡️ Security & Roles
The platform utilizes stateless JWT authentication stored in HTTP-only cookies.
Roles include:
- `MEMBER`: Standard alumni access.
- `ADMIN`: Can moderate content (Jobs, Businesses).
- `TREASURER`: Can verify and approve Welfare Contributions.
- `SUPER_ADMIN`: Can do everything, plus assign roles and view global analytics.

To grant yourself Super Admin privileges locally, run:
\`\`\`bash
node scripts/make_admin.js
\`\`\`

---

## 🛠️ Technology Stack
- **Frontend**: Next.js 14/15 App Router, React 19, Tailwind CSS.
- **Backend**: Next.js Route Handlers (Serverless APIs).
- **Database**: MySQL (via `mysql2` native driver).
- **Authentication**: Custom JWT implementation (via `jose`).
- **Payments**: Paystack API integration.
