# Backend Server Setup & Run Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account with database setup

## Environment Variables

Create a `.env.development` file in the backend root directory (`zingcabv2.2b/`) with:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Zone Pricing Feature Flag (optional, defaults to true)
ENABLE_ZONE_PRICING=true
```

## Install Dependencies

```bash
cd zingcabv2.2b
npm install
```

## Run Database Migrations

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration files in order:
   - `database/migrations/create_zones_tables.sql` (if not already run)
   - `database/migrations/create_contacts_table.sql`

## Run Backend Server

### Development Mode
```bash
npm run dev
# OR if dev script doesn't exist:
node server.cjs
```

The server will start on `http://localhost:5000`

## Test the Server

Check health endpoint:
```bash
curl http://localhost:5000/health
```

## API Endpoints

### Health Check
- `GET /health` - Server status

### Bookings
- `GET /api/booking` - List bookings (with pagination & filters)
- `GET /api/booking/:id` - Get single booking
- `POST /api/booking` - Create booking
- `PUT /api/booking/:id` - Update booking

### Contacts
- `GET /api/contact` - List contacts (with pagination & search)
- `GET /api/contact/:id` - Get single contact
- `POST /api/contact` - Create contact
- `PUT /api/contact/:id` - Update contact

### Fare Estimation
- `POST /api/fare/estimate` - Calculate fare

## Troubleshooting

1. **Port already in use**: Change PORT in `.env.development`
2. **Supabase connection error**: Check SUPABASE_URL and SUPABASE_ANON_KEY
3. **CORS errors**: Update CORS origin in `server.cjs` if needed

