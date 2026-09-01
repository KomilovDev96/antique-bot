# Graph Report - .  (2026-09-01)

## Corpus Check
- 143 files · ~270,476 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 421 nodes · 527 edges · 29 communities (20 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.84)
- Token cost: 65,322 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Post Browsing & Estimate Flows|Post Browsing & Estimate Flows]]
- [[_COMMUNITY_Post Moderation Actions|Post Moderation Actions]]
- [[_COMMUNITY_API Routes & Controllers|API Routes & Controllers]]
- [[_COMMUNITY_Auth Middleware & Routes|Auth Middleware & Routes]]
- [[_COMMUNITY_Bot Handler Dispatch|Bot Handler Dispatch]]
- [[_COMMUNITY_Admin Panel Frontend|Admin Panel Frontend]]
- [[_COMMUNITY_Admin Panel Dependencies|Admin Panel Dependencies]]
- [[_COMMUNITY_Admin Controller Operations|Admin Controller Operations]]
- [[_COMMUNITY_Bot Start & User Onboarding|Bot Start & User Onboarding]]
- [[_COMMUNITY_Backend Dependencies|Backend Dependencies]]
- [[_COMMUNITY_App & Bot Bootstrap|App & Bot Bootstrap]]
- [[_COMMUNITY_Post API & Server Entry|Post API & Server Entry]]
- [[_COMMUNITY_Estimate Scene & Model|Estimate Scene & Model]]
- [[_COMMUNITY_Admin Dashboard Routes (legacy)|Admin Dashboard Routes (legacy)]]
- [[_COMMUNITY_tmp.txt Staging Copy|tmp.txt Staging Copy]]
- [[_COMMUNITY_Admin Panel Entry & Docs|Admin Panel Entry & Docs]]
- [[_COMMUNITY_Watermark Utility|Watermark Utility]]
- [[_COMMUNITY_Collage Utility|Collage Utility]]
- [[_COMMUNITY_tmp Estimate Controller Copy|tmp Estimate Controller Copy]]
- [[_COMMUNITY_Admin Keyboard|Admin Keyboard]]
- [[_COMMUNITY_Telegram Proxy Route|Telegram Proxy Route]]
- [[_COMMUNITY_In-Memory Session Store|In-Memory Session Store]]
- [[_COMMUNITY_Bot Watermark Utility (dup)|Bot Watermark Utility (dup)]]
- [[_COMMUNITY_Session Middleware|Session Middleware]]
- [[_COMMUNITY_Quiet Delete Design Note|Quiet Delete Design Note]]
- [[_COMMUNITY_TODO Delete TG Messages|TODO: Delete TG Messages]]
- [[_COMMUNITY_Unique Code Index Fix Note|Unique Code Index Fix Note]]

## God Nodes (most connected - your core abstractions)
1. `downloadImageBuffer` - 14 edges
2. `escapeHtml` - 12 edges
3. `axiosClient` - 7 edges
4. `handleText()` - 6 edges
5. `scripts` - 5 edges
6. `Admin Panel (React/Vite)` - 5 edges
7. `Posts()` - 4 edges
8. `estimateFlow()` - 4 edges
9. `sendForApproval()` - 4 edges
10. `start()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Admin UI Post Management (status filter, date sort, delete button, pending badge)` --references--> `Posts()`  [AMBIGUOUS]
  NOTES.md → admin-panel/src/pages/Posts.jsx
- `JWT Auth — Auto-Logout on 401 (fixes prior expired-token bug)` --references--> `axiosClient`  [EXTRACTED]
  NOTES.md → admin-panel/src/api/axiosClient.js
- `Admin Panel (React/Vite)` --references--> `Dashboard()`  [EXTRACTED]
  NOTES.md → admin-panel/src/pages/Dashboard.jsx
- `Admin Panel (React/Vite)` --references--> `Estimates()`  [EXTRACTED]
  NOTES.md → admin-panel/src/pages/Estimates.jsx
- `Admin Panel (React/Vite)` --references--> `Orders()`  [EXTRACTED]
  NOTES.md → admin-panel/src/pages/Orders.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Post Moderation & Approval Workflow** — tmp_sendforapproval, notes_quiet_delete, notes_admin_ui_features, models_post_post [INFERRED 0.75]
- **Admin Panel Frontend Bootstrap (Vite/React)** — admin_panel_index_index, admin_panel_readme_react_vite_template, notes_admin_panel [INFERRED 0.75]

## Communities (29 total, 9 thin omitted)

### Community 0 - "Post Browsing & Estimate Flows"
Cohesion: 0.05
Nodes (42): { escapeHtml, downloadImageBuffer }, { Markup }, Post, { downloadImageBuffer, escapeHtml }, { Markup }, Post, { BOT_TOKEN, ADMIN_ID }, { downloadImageBuffer, escapeHtml } (+34 more)

### Community 1 - "Post Moderation Actions"
Cohesion: 0.05
Nodes (28): adminService, postService, adminService, { BOT_TOKEN }, { downloadImageBuffer }, Post, postService, approveAction (+20 more)

### Community 2 - "API Routes & Controllers"
Cohesion: 0.05
Nodes (26): adminRoutes, apiRouter, authRoutes, estimateRoutes, express, telegramRoutes, jwt, bot (+18 more)

### Community 3 - "Auth Middleware & Routes"
Cohesion: 0.06
Nodes (30): jwt, auth, express, Post, publishPostToTelegram, router, authMiddleware, express (+22 more)

### Community 4 - "Bot Handler Dispatch"
Cohesion: 0.07
Nodes (26): approveAction, cancelAction, estimateReplyAction, foundAction, { handlePhoto, handleText }, handleTayyorCommand, { Markup }, myPostsCommand (+18 more)

### Community 5 - "Admin Panel Frontend"
Cohesion: 0.12
Nodes (18): axiosClient, PrivateRoute(), Admin Panel (React/Vite), Admin UI Post Management (status filter, date sort, delete button, pending badge), JWT Auth — Auto-Logout on 401 (fixes prior expired-token bug), Backend (Node/Express + MongoDB, src/), Telegram Bot (Telegraf, src/bot/services), Antique Bot / Admin Panel Project (+10 more)

### Community 6 - "Admin Panel Dependencies"
Cohesion: 0.07
Nodes (26): dependencies, antd, axios, react, react-dom, react-router-dom, @tanstack/react-query, devDependencies (+18 more)

### Community 7 - "Admin Controller Operations"
Cohesion: 0.09
Nodes (13): adminService, approvePost(), bot, Order, Post, postService, publishPostToTelegram, mongoose (+5 more)

### Community 8 - "Bot Start & User Onboarding"
Cohesion: 0.11
Nodes (14): { ADMIN_ID }, mainKeyboard, User, mainKeyboard, userService, mainKeyboard, { Markup }, mainKeyboard (+6 more)

### Community 9 - "Backend Dependencies"
Cohesion: 0.10
Nodes (19): dependencies, axios, cors, dotenv, express, jimp, jsonwebtoken, mongoose (+11 more)

### Community 10 - "App & Bot Bootstrap"
Cohesion: 0.12
Nodes (14): { ADMIN_PANEL_ORIGIN }, allowedOrigins, apiRouter, app, bot, connectDB, cors, express (+6 more)

### Community 11 - "Post API & Server Entry"
Cohesion: 0.18
Nodes (9): getPostById(), getPosts(), Post, express, { getPosts, getPostById }, router, adminRoutes, express (+1 more)

### Community 12 - "Estimate Scene & Model"
Cohesion: 0.18
Nodes (8): Estimate, estimateSchema, mongoose, { BOT_TOKEN }, { downloadImageBuffer, escapeHtml }, Estimate, estimateWizard, { Scenes, Markup }

### Community 13 - "Admin Dashboard Routes (legacy)"
Cohesion: 0.33
Nodes (4): getAdminDashboard(), { getAdminDashboard }, express, router

### Community 14 - "tmp.txt Staging Copy"
Cohesion: 0.33
Nodes (5): { ADMIN_ID, BOT_TOKEN }, { downloadImageBuffer, escapeHtml }, Estimate, estimateWizard, { Scenes }

### Community 15 - "Admin Panel Entry & Docs"
Cohesion: 0.40
Nodes (5): Admin Panel Entry HTML (Vite root document), @vitejs/plugin-react (Babel Fast Refresh), @vitejs/plugin-react-swc (SWC Fast Refresh), React + Vite Template Setup, typescript-eslint (type-aware lint rules)

### Community 16 - "Watermark Utility"
Cohesion: 0.40
Nodes (3): fs, Jimp, path

### Community 17 - "Collage Utility"
Cohesion: 0.40
Nodes (3): fs, Jimp, path

## Ambiguous Edges - Review These
- `Posts()` → `Admin UI Post Management (status filter, date sort, delete button, pending badge)`  [AMBIGUOUS]
  NOTES.md · relation: references

## Knowledge Gaps
- **258 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+253 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Posts()` and `Admin UI Post Management (status filter, date sort, delete button, pending badge)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _260 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Post Browsing & Estimate Flows` be split into smaller, more focused modules?**
  _Cohesion score 0.05451127819548872 - nodes in this community are weakly interconnected._
- **Should `Post Moderation Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `API Routes & Controllers` be split into smaller, more focused modules?**
  _Cohesion score 0.052564102564102565 - nodes in this community are weakly interconnected._
- **Should `Auth Middleware & Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.05641025641025641 - nodes in this community are weakly interconnected._
- **Should `Bot Handler Dispatch` be split into smaller, more focused modules?**
  _Cohesion score 0.06881720430107527 - nodes in this community are weakly interconnected._