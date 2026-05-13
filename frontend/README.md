# Insight-Ink Frontend

A standalone frontend application for the Insight-Ink blog platform. Built with vanilla HTML, CSS, and JavaScript - no frameworks required!

## 📁 Structure

```
frontend/
├── index.html           # Home page - Posts list
├── login.html           # Login page
├── register.html        # Registration page
├── write.html           # Write/create new post
├── edit.html            # Edit existing post
├── post.html            # View single post with comments
├── profile.html         # User profile page
├── inbox.html           # Notifications inbox
├── admin.html           # Super-admin dashboard
├── css/
│   └── style.css        # Global styles and responsive design
└── js/
    ├── api.js           # API client - all backend interactions
    ├── utils.js         # Helper functions and auth management
    └── pages/
        ├── home.js      # Home page logic
        ├── editor.js    # Write/edit page logic
        ├── post.js      # Single post page logic
        ├── edit.js      # Edit post page logic
        ├── profile.js   # Profile page logic
        ├── inbox.js     # Notifications page logic
        └── admin.js     # Admin dashboard logic
```

## 🚀 Getting Started

### 1. **Copy the frontend folder to your deployment location**
```bash
# Copy entire frontend folder to your web server or hosting
cp -r frontend/ /path/to/your/webserver/
```

### 2. **Update API Base URL (if needed)**
Edit `frontend/js/api.js` and change the `API_BASE` if your backend is on a different URL:
```javascript
const API_BASE = 'http://localhost:5000/api';  // Change this URL
```

### 3. **Open in browser**
```
http://localhost:8000/frontend/index.html
# or wherever you serve the frontend from
```

## 📋 Features

### Authentication
- **Login** - User authentication with email/password
- **Register** - Create new account
- **Logout** - End session

### Posts
- **Browse Posts** - View all posts with pagination
- **Read Post** - View full post with comments
- **Write Post** - Create new post with markdown editor
- **Edit Post** - Modify your own posts
- **Delete Post** - Remove posts (owner or admin only)
- **Like Posts** - Like/unlike posts
- **Comment** - Add comments to posts

### User Features
- **Profile** - View and edit user profile
- **My Posts** - See all your published posts
- **Notifications Inbox** - View admin notices and system notifications

### Admin Features (Super Admin Only)
- **Dashboard** - View platform stats (users, posts, admins)
- **User Management** - View all users and promote to admin
- **Send Notices** - Send admin notices/emails to users
- **Activity Tracking** - Monitor user activities

## 🎨 Markdown Editor

The editor includes a **full-featured toolbar** with:
- **Text Formatting**: Bold, Italic, Underline, Strikethrough
- **Structure**: Headings (H1-H3), Lists, Quotes, Code blocks
- **Media**: Link and Image insertion
- **Live Preview**: Real-time markdown rendering

### Keyboard Shortcuts
- `Ctrl+B` - Bold
- `Ctrl+I` - Italic
- `Ctrl+U` - Underline
- `Shift+Enter` - New line
- `Ctrl+Enter` - New paragraph

## 🔌 API Integration

All API calls are handled through `js/api.js`. The frontend communicates with the backend via:

### Available APIs
```javascript
// Authentication
authAPI.login(email, password)
authAPI.register(email, password, username)
authAPI.logout()
authAPI.me()

// Posts
postsAPI.getAll(page)
postsAPI.getById(id)
postsAPI.create(title, excerpt, content)
postsAPI.update(id, title, excerpt, content)
postsAPI.delete(id)
postsAPI.like(id)
postsAPI.comment(id, text)
postsAPI.deleteComment(postId, commentId)

// Admin
adminAPI.getDashboard()
adminAPI.getUsers()
adminAPI.promoteUser(userId)
adminAPI.sendNotice(userId, subject, message)

// Notifications
notificationsAPI.getAll()
notificationsAPI.markAsRead(id)
```

## 🎯 Deployment Options

### Option 1: Static File Hosting (Recommended)
Deploy to any static hosting service:
- **Netlify** - Drag & drop deployment
- **Vercel** - Next.js compatible static hosting
- **GitHub Pages** - Free hosting
- **AWS S3 + CloudFront** - Scalable CDN
- **Cloudflare Pages** - Fast global CDN

### Option 2: Web Server
```bash
# Copy to your web server
cp -r frontend/ /var/www/html/

# Serve with any web server (nginx, Apache, etc)
# Just make sure to update API_BASE in api.js
```

### Option 3: Docker Container
```dockerfile
FROM nginx:alpine
COPY frontend/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔄 Backend Requirements

Make sure your backend provides these endpoints:

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id
POST   /api/posts/:id/like
POST   /api/posts/:id/comment
DELETE /api/posts/:id/comment/:commentId

GET    /api/admin/dashboard
GET    /api/admin/users
POST   /api/admin/promote/:userId
POST   /api/admin/send-notice

GET    /api/notifications
PUT    /api/notifications/:id/read
```

## 🌐 CORS Configuration

Your backend must allow CORS requests from the frontend URL:

```javascript
// In your backend server.js
app.use(cors({
    origin: ['http://localhost:3000', 'http://yourdomain.com'],
    credentials: true
}));
```

## 📱 Responsive Design

The frontend is fully responsive and works on:
- **Desktop** - Full 2-column layouts
- **Tablet** - Optimized grid layouts
- **Mobile** - Single column, touch-friendly

## 🎨 Customization

### Change Theme Colors
Edit `frontend/css/style.css`:
```css
:root {
    --primary-bg: #ffffff;
    --accent-color: #6366f1;
    --text-main: #1a202c;
    /* ... more colors ... */
}
```

### Dark Mode
Add `data-theme="dark"` to `<html>` tag:
```html
<html lang="en" data-theme="dark">
```

## 🔒 Security Notes

1. **HTTPS Only** - Always use HTTPS in production
2. **API Keys** - Don't expose backend API keys in frontend code
3. **CORS** - Configure CORS properly in backend
4. **Authentication** - Use secure cookie-based authentication
5. **XSS Prevention** - The frontend uses innerHTML carefully; sanitize user input on backend

## 📞 Support & Issues

For issues with the frontend:
1. Check the browser console for errors
2. Verify API_BASE URL is correct
3. Check backend is running and accessible
4. Ensure CORS is enabled on backend
5. Check network tab in DevTools for failed requests

## 📝 License

Same as main Insight-Ink project.
