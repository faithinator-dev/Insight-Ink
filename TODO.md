# Project Enhancement: Medium/Dev.to Style Blog

## Completed Tasks

### 1. Model Updates
- [x] Extended `Post.js` schema with `excerpt`, `readTime`, `reactions`, and `comments`.
- [x] Added timestamps to the Post model.

### 2. Controller Enhancements
- [x] Refactored `postController.js` to include view rendering logic (`renderPosts`, `renderPost`).
- [x] Maintained and cleaned up API JSON routes.
- [x] Added sorting to posts (newest first).

### 3. Route Configuration
- [x] Updated `postRoutes.js` to separate view routes (`/`, `/post/:id`) and API routes (`/api/posts`).
- [x] Integrated new controller methods.

### 4. Server Configuration
- [x] Configured EJS as the view engine.
- [x] Set up static file serving for `public` directory.
- [x] Added path resolution for views.
- [x] Implemented a basic 404 error handler.

### 5. Frontend Development (EJS)
- [x] Created `views/partials/header.ejs` with Medium-style navbar (Logo, Search, Write btn, Profile).
- [x] Created `views/partials/footer.ejs`.
- [x] Updated `views/posts.ejs` with Dev.to-style cards (Image placeholders, Meta data, Excerpts, Reactions).
- [x] Updated `views/post.ejs` for clean reading experience (Hero section, Meta data, Reactions bar, Comments).
- [x] Created `views/layouts/main.ejs` as a base template.

### 6. Styling
- [x] Updated `public/css/style.css` with modern, clean typography (Inter, Lora).
- [x] Added support for Light/Dark modes using CSS variables.
- [x] Implemented responsive design for mobile views.
- [x] Added Medium-like spacing and shadows.

## Future Steps
- [ ] Implement actual user authentication (Login/Signup).
- [ ] Connect the "Write" button to a post creation form.
- [ ] Implement search functionality.
- [ ] Add ability to post comments and like posts via frontend.
- [ ] Set up image upload for post hero images.
