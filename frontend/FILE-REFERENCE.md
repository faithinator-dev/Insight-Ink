# Frontend File Reference

## 📄 HTML Pages

| File | Purpose | Features |
|------|---------|----------|
| `index.html` | Home page / Posts feed | Browse posts, pagination, links to auth pages |
| `login.html` | Login page | Email/password authentication |
| `register.html` | Registration page | Create new account with email & password |
| `write.html` | Create post page | Full markdown editor with toolbar |
| `edit.html` | Edit post page | Same editor, loads existing post content |
| `post.html` | Single post view | Read full post, like, comment, edit/delete options |
| `profile.html` | User profile page | View profile, edit name/bio, see your posts |
| `inbox.html` | Notifications | View admin notices and system notifications |
| `admin.html` | Admin dashboard | User management, send notices, view stats |

## 💾 JavaScript Files

### Core Files

**`js/api.js`** - Backend API Client
- Centralized API endpoint definitions
- Authentication API methods
- Posts API methods  
- Admin API methods
- Notifications API methods
- Error handling and response parsing

**`js/utils.js`** - Utility Functions & Auth State
- `auth` object - User session management
- DOM helper functions (`$`, `$$`, `html`, `text`, etc.)
- `showSuccess()`, `showError()`, `showAlert()` - Notifications
- `formatDate()`, `truncate()` - Text formatting
- `markdownToHtml()` - Markdown parsing
- `Storage` - LocalStorage wrapper

### Page-Specific Scripts

**`js/pages/home.js`** - Home Page
- `loadPosts(page)` - Fetch and render posts
- `renderPagination()` - Handle pagination
- Auto-load on page load

**`js/pages/editor.js`** - Write/Edit Pages
- `insertMarkdown()` - Insert formatted text
- Toolbar button handlers (Bold, Italic, etc.)
- Keyboard shortcut handlers
- Preview toggle
- `handlePublish()` - Submit new post

**`js/pages/post.js`** - Single Post View
- `loadPost()` - Fetch post with comments
- `handleLike()` - Like/unlike post
- `handleComment()` - Post comment
- `renderComments()` - Display all comments
- `deletePost()`, `deleteComment()` - Delete actions

**`js/pages/edit.js`** - Edit Post Page
- Same editor as write page
- `loadPost()` - Load existing post
- `handleUpdate()` - Submit changes
- Authorization check (owner/admin only)

**`js/pages/profile.js`** - User Profile
- `loadProfile()` - Fetch user data
- `loadUserPosts()` - Get user's posts
- `handleUpdateProfile()` - Save profile changes
- Password change modal

**`js/pages/inbox.js`** - Notifications
- `loadNotifications()` - Fetch user notifications
- `markAsRead()` - Mark notification as read
- Auto-refresh every 30 seconds
- Unread count badge

**`js/pages/admin.js`** - Admin Dashboard
- `loadDashboard()` - Fetch platform stats
- `loadUsers()` - Display user list
- `promoteUser()` - Promote user to admin
- `handleSendNotice()` - Send admin notice
- Authorization check (admin only)

## 🎨 CSS Files

**`css/style.css`** - Main Stylesheet
- CSS variables for theming (colors, fonts)
- Dark mode support
- Component styles:
  - Navigation bar
  - Buttons (primary, secondary, danger, success)
  - Forms (inputs, textareas, labels)
  - Cards
  - Modals
  - Grid layouts
  - Badges
  - Toolbars
  - Responsive breakpoints

### Responsive Breakpoints
- **Desktop**: Full width layouts
- **Tablet**: (768px) - Adjusted grid layouts
- **Mobile**: (< 768px) - Single column, stacked elements

## 🔄 How They Work Together

### Page Load Flow
1. HTML loads
2. Imports `api.js` and `utils.js`
3. `utils.js` initializes auth on DOM load
4. Page-specific script loads (`pages/*.js`)
5. Page script calls `auth.init()` via `utils.js`
6. User data retrieved and UI updated
7. Page-specific content loaded from API

### Authentication Flow
1. User navigates to `login.html` or `register.html`
2. Submits form
3. `auth.login()` or `auth.register()` called
4. `authAPI` makes POST request
5. User data stored in `auth.user`
6. `auth.updateUI()` refreshes navigation
7. Redirect to `index.html` on success

### API Request Flow
```
Page Form Submit
    ↓
Event Handler (e.g., handlePublish)
    ↓
API Method (e.g., postsAPI.create)
    ↓
apiCall() Generic Handler
    ↓
fetch() to Backend
    ↓
Response Parsing & Error Handling
    ↓
Return Data or Throw Error
    ↓
Handler Catches Error / Receives Data
    ↓
UI Update (showSuccess, loadPosts, etc.)
```

## 🔑 Key Concepts

### Auth State (`auth` object)
```javascript
auth.user          // Current user object or null
auth.isAuthenticated() // Boolean
auth.isSuperAdmin()    // Boolean
auth.isAdmin()         // Boolean
auth.init()           // Initialize from API
auth.login()          // Login user
auth.logout()         // Logout user
auth.updateUI()       // Refresh nav based on auth state
```

### DOM Queries
```javascript
$('selector')      // document.querySelector
$$('selector')     // document.querySelectorAll
```

### Notifications
```javascript
showSuccess(msg)   // Green success alert
showError(msg)     // Red error alert
showAlert(msg, type) // Custom alert with type
```

### Storage
```javascript
Storage.set(key, value)   // Save to localStorage
Storage.get(key)          // Get from localStorage
Storage.remove(key)       // Delete from localStorage
Storage.clear()           // Clear all
```

## 🔌 Backend API Endpoints

All endpoints are in `js/api.js` as method calls:

```javascript
// Auth (public)
/api/auth/login          // POST
/api/auth/register       // POST
/api/auth/logout         // POST
/api/auth/me             // GET

// Posts (public read, protected write)
/api/posts               // GET (all posts)
/api/posts/:id           // GET (single post)
/api/posts               // POST (create)
/api/posts/:id           // PUT (update)
/api/posts/:id           // DELETE (delete)
/api/posts/:id/like      // POST (toggle like)
/api/posts/:id/comment   // POST (add comment)
/api/posts/:id/comment/:commentId  // DELETE

// Admin (protected - admin only)
/api/admin/dashboard     // GET
/api/admin/users         // GET
/api/admin/promote/:userId  // POST
/api/admin/send-notice   // POST

// Notifications (protected)
/api/notifications       // GET
/api/notifications/:id/read  // PUT
```

## 🚀 Development Tips

1. **Use browser DevTools** - F12 to see console errors and network requests
2. **Check Network tab** - See all API calls and responses
3. **Test auth state** - Open console and check `auth.user`
4. **Test localStorage** - Open Console and check `localStorage`
5. **Add debugging** - Use `console.log()` in page scripts
6. **Update API_BASE** - Change in `api.js` for different backend URLs

## 📦 No Dependencies

This frontend has **ZERO external dependencies**:
- No React, Vue, Angular
- No jQuery
- No UI frameworks
- Only uses native DOM APIs and `marked.js` CDN for markdown

Everything is vanilla JavaScript!

## ✅ Checklist for Production

- [ ] Update `API_BASE` in `js/api.js` to production backend URL
- [ ] Use HTTPS in production
- [ ] Enable CORS on backend
- [ ] Test all features (auth, posts, comments, admin)
- [ ] Test on mobile browsers
- [ ] Update privacy/terms pages (if applicable)
- [ ] Set up error tracking/logging
- [ ] Configure backup/recovery strategy
- [ ] Test HTTPS certificate validity
- [ ] Monitor API response times
