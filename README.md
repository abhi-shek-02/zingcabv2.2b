# ZingCab API

A geolocation-based cab booking system for West Bengal with advanced pricing engine.

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file in the root directory:
```env
PORT=3002
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note:** If you don't have Supabase credentials, the app will run with a mock database for development.

### Running the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**Build for production:**
```bash
npm run build
```
*Validates JavaScript syntax, checks required config files, and prepares for deployment*



## API Endpoints

- `GET /health` - Health check
- `POST /api/booking` - Create booking
- `POST /api/contact` - Contact form
- `POST /api/fare` - Calculate fare
- `GET /api/routes` - Get routes

## Project Structure

```
├── server.js          # Main server file
├── routes/            # API route handlers
├── config/            # Configuration files
└── utils/             # Utility functions
```

## License

MIT 