# TODO List for Startup Benefits Platform

## Backend Setup
- [x] Initialize Node.js project in backend/ (package.json)
- [ ] Install backend dependencies (express, mongoose, jsonwebtoken, bcryptjs, cors, dotenv)
- [x] Create server.js with Express app setup
- [x] Define Mongoose models: User, Deal, Claim
- [x] Create auth routes (register, login)
- [x] Create deals routes (get all, get one)
- [x] Create claims routes (create claim, get user claims)
- [x] Add JWT middleware for protected routes
- [x] Ensure locked deals require verification

## Frontend Setup
- [x] Initialize Next.js project with TypeScript in frontend/
- [ ] Install frontend dependencies (next, react, typescript, tailwindcss, framer-motion, axios, @types/node, etc.)
- [x] Set up Tailwind CSS
- [x] Create layout and global styles

## Frontend Pages and Components
- [x] Landing Page: Hero with animations, CTA
- [x] Deals Listing Page: List deals with filters/search, locked/unlocked
- [x] Deal Details Page: Full info, claim button
- [x] User Dashboard: Profile, claimed deals list
- [x] Add authentication context and protected routes

## Integration and Features
- [x] Connect frontend to backend APIs
- [x] Implement JWT auth on frontend
- [x] Add high-quality animations (page transitions, micro-interactions)
- [ ] Optional: Add 3D element using Three.js on landing page

## README and Final Touches
- [x] Create README.md explaining flow, auth, claiming process, etc.
- [ ] Test end-to-end flow
- [ ] Run and test locally
- [ ] Optional: Deploy
