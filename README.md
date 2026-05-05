# Portfolio Website

A modern, interactive portfolio website featuring a 3D animated background, custom cursor effects, smooth scroll animations, and a fully functional contact form with admin panel.

## Features

### Frontend
- **3D Animated Background**: Interactive dotted surface using Three.js
- **Custom Cursor**: Smooth, animated cursor with hover effects
- **Scroll Animations**: Elements reveal on scroll with smooth transitions
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Smooth Navigation**: Animated navigation with active state indicators

### Backend
- **Contact Form**: Email notifications via Nodemailer
- **SQLite Database**: Persistent storage for form submissions (sql.js)
- **Admin Panel**: View, update status, and delete submissions
- **RESTful API**: Clean API endpoints for form handling
- **Health Check**: Server status monitoring endpoint

## Tech Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom animations, transitions, and responsive design
- **JavaScript (ES6+)**: Modern JavaScript with modules
- **Three.js**: 3D graphics and animations
- **Tailwind CSS**: Utility-first CSS framework (via CDN)

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **SQLite (sql.js)**: In-memory database with file persistence
- **Nodemailer**: Email sending via SMTP

### Development Tools
- **Puppeteer**: Automated screenshot testing
- **ESLint**: Code linting (optional)

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd "Portfolio Website"
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` with your email credentials:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
EMAIL_TO=your-email@gmail.com
PORT=3001
```

### Email Configuration

**For Gmail:**
1. Go to Google Account → Security → 2-Step Verification
2. Create an App Password
3. Use the App Password as `SMTP_PASS`

**For other providers:**
- Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` accordingly

## Running the Application

### Start the backend server:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

### Start the frontend (in another terminal):
```bash
node serve.mjs
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Contact Form
- `POST /api/contact` - Submit contact form
  - Body: `{ name, email, message }`

## Admin Panel

Access the admin panel at `http://localhost:3000/admin.html` to manage contact form submissions.

### Features
- View all form submissions
- Filter by status (New, Read, Replied, Archived)
- Update submission status
- Delete submissions
- Real-time statistics

### Authentication
The admin panel uses API key authentication. Set your `ADMIN_API_KEY` in `.env`:

```env
ADMIN_API_KEY=your-strong-random-api-key-here
```

The API key is stored in localStorage for persistent sessions.

### Admin Endpoints
- `GET /api/submissions` - Get all submissions (optional `?status=new` filter)
- `PATCH /api/submissions/:id` - Update submission status
  - Body: `{ status }` (valid: `new`, `read`, `replied`, `archived`)
- `DELETE /api/submissions/:id` - Delete a submission

### Health Check
- `GET /api/health` - Server health status

## Database

The SQLite database is stored in `database.sqlite` and is created automatically on first run.

### Submission Status Values
- `new` - Unread submission
- `read` - Viewed but not replied
- `replied` - Response sent
- `archived` - No longer active

## Brand Assets

The `brand_assets/` folder contains:
- `profile_image.jpg` - Profile picture for the portfolio

When adding new assets, place them in this folder and reference them in your code.

## Development Workflow

### Taking Screenshots

The project includes a screenshot utility for visual testing:

```bash
node screenshot.mjs http://localhost:3000
```

Screenshots are saved to `temporary screenshots/` with auto-incremented filenames. Add a label suffix:

```bash
node screenshot.mjs http://localhost:3000 my-label
```

### Local Development Server

The frontend is served via a custom Node.js server:

```bash
node serve.mjs
```

This serves the project root at `http://localhost:3000` with proper MIME types and CORS headers.

## Project Structure

```
Portfolio Website/
├── assets/
│   ├── css/
│   │   ├── main.css              # Main stylesheet
│   │   └── admin.css             # Admin panel styles
│   └── js/
│       ├── main.js               # Entry point
│       ├── admin.js              # Admin panel functionality
│       └── modules/
│           ├── contactForm.js    # Form handling
│           ├── cursor.js         # Custom cursor
│           ├── dottedSurface.js  # Three.js 3D background
│           ├── navigation.js     # Navigation logic
│           └── scrollReveal.js   # Scroll animations
├── brand_assets/
│   └── profile_image.jpg         # Brand images
├── .claude/                      # Claude Code configuration
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── CLAUDE.md                     # Project instructions for Claude
├── admin.html                    # Admin panel page
├── database.js                   # Database initialization
├── database.sqlite               # SQLite database file
├── index.html                    # Main HTML file
├── package.json                   # Project dependencies
├── README.md                     # This file
├── screenshot.mjs                # Screenshot utility
├── serve.mjs                     # Frontend dev server
└── server.js                     # Express backend server
```

## Troubleshooting

### Email Not Sending
- Verify SMTP credentials in `.env`
- Check if your email provider requires App Passwords (Gmail does)
- Ensure SMTP port is correct (587 for TLS, 465 for SSL)
- Check firewall settings

### Database Issues
- Delete `database.sqlite` and restart the server to recreate
- Ensure write permissions on the project directory

### Frontend Not Loading
- Ensure `serve.mjs` is running on port 3000
- Check browser console for JavaScript errors
- Verify all asset paths are correct

### Port Already in Use
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

## Deployment

### Environment Variables
Set the following environment variables in production:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `SMTP_FROM`, `EMAIL_TO`
- `PORT` (default: 3001)

### Production Build
1. Set `NODE_ENV=production`
2. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name portfolio-api
pm2 start serve.mjs --name portfolio-frontend
```

### Security Considerations
- Never commit `.env` files
- Use strong SMTP passwords
- Consider adding rate limiting to the contact form
- Implement CSRF protection for the admin panel
- Use HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own portfolio.

## Credits

Built with ❤️ using modern web technologies.

---

For questions or support, please open an issue on the repository.
