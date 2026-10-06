# TASK: Build Antique Collector Mobile App for iOS + Android

You are working on an existing project:

GitHub repository:
https://github.com/KomilovDev96/antique-bot

The existing Telegram bot and its backend/database are part of the same ecosystem.

Your task is to build a **production-ready mobile application for iOS and Android using React Native + TypeScript**.

The application is a modern AI-powered platform for antique and collectible enthusiasts.

Do not create a simple demo or mockup. Build the application architecture and UI so it can be extended into a real production product.

---

# 1. MAIN PRODUCT IDEA

The application allows users to:

* register/login with email
* verify email
* create a collector profile
* specify what they collect
* manage their personal collection
* photograph an antique/coin/object
* use AI to identify it
* search first in our internal database
* compare the uploaded object with similar objects
* search the internet only when the internal database does not contain enough information
* see sources for external information
* ask an AI assistant questions about their own collection
* search their collection using natural language
* buy collectible items
* sell collectible items
* submit objects for inspection/appraisal
* create purchase requests
* create sale listings
* communicate with sellers/buyers
* manage their own collection
* organize objects by category/year/country/etc.

The application must support many types of collectibles, not only coins.

Examples:

* coins
* banknotes
* paintings
* watches
* weapons
* medals
* stamps
* books
* jewelry
* porcelain
* historical objects
* archaeological objects
* manuscripts
* other collectibles

The architecture must therefore be generic and extensible.

---

# 2. IMPORTANT: EXISTING TELEGRAM BOT

The existing Telegram bot is NOT a separate product.

The mobile application must eventually use the SAME backend and SAME database.

Architecture:

Mobile App
|
v
Backend
|
+---- PostgreSQL
|
+---- Redis
|
+---- Object Storage
|
+---- AI services
|
+---- Telegram Bot

Do NOT create a second independent database for the mobile application.

Before implementing backend-dependent functionality, inspect the existing repository carefully and understand:

* current backend
* database
* models
* API
* Telegram bot
* existing item structure
* existing image handling
* existing AI functionality
* existing buy/sell functionality if present
* existing user data

Reuse existing functionality wherever possible.

Do not duplicate business logic.

If an existing API can be reused, use it.

If the existing architecture needs to be extended, extend it cleanly.

---

# 3. TECHNOLOGY

Use:

* React Native
* TypeScript
* Expo if compatible with the existing architecture
* Expo Router
* TanStack Query
* Zustand
* React Hook Form
* Zod
* NativeWind OR a clean centralized styling system
* React Native Reanimated
* Expo Camera
* Expo Image Picker
* Expo Notifications
* Expo Secure Store

Use libraries only when they provide real value.

Avoid unnecessary dependencies.

The application must support:

* iOS
* Android
* responsive layouts
* different screen sizes
* safe areas
* dark mode
* light mode

---

# 4. DESIGN DIRECTION

You have full responsibility for the visual design.

Do NOT make the application look like a generic CRUD application.

Design it as a premium digital product for collectors.

Visual direction:

* elegant
* modern
* minimal
* premium
* sophisticated
* trustworthy
* museum / auction-house feeling
* modern AI product
* clean typography
* excellent spacing
* subtle animations
* beautiful cards
* high-quality image presentation

The UI should feel suitable for:

* serious collectors
* antique dealers
* numismatists
* art collectors
* historical-object collectors

Avoid excessive decoration.

Do not use gradients everywhere.

Do not use random colors.

Create a coherent design system.

Suggested visual direction:

* neutral background
* dark graphite text
* warm ivory surfaces
* subtle gold/brass accent
* restrained green/blue for status
* high-quality typography
* large object photography
* rounded but not childish cards

Create reusable design tokens:

* colors
* typography
* spacing
* radii
* shadows
* borders
* icon sizes
* animation durations

Support both light and dark themes.

---

# 5. APP STRUCTURE

Create the following main navigation:

1. Home
2. Collection
3. Scan
4. Marketplace
5. Assistant

Profile/settings should be accessible from the top-right/profile button.

The navigation must feel natural on mobile.

---

# 6. ONBOARDING

First launch:

Show a premium onboarding experience.

Explain:

* organize your collection
* identify objects with AI
* discover historical information
* buy and sell collectibles
* get objects inspected
* ask AI about your collection

Then ask:

"What do you collect?"

Allow multiple selections:

* Coins
* Banknotes
* Paintings
* Watches
* Weapons
* Medals
* Stamps
* Books
* Jewelry
* Porcelain
* Historical objects
* Other

Allow "Skip".

The selected categories should personalize the Home screen.

Do not hardcode the entire application around coins.

---

# 7. AUTHENTICATION

Implement:

Register:

* email
* password
* confirm password

After registration:

* send email verification
* show verification screen
* allow resend verification email
* allow change email

Login:

* email
* password

Also implement:

* forgot password
* reset password
* logout
* session persistence
* refresh token handling
* secure token storage

Use Expo Secure Store for sensitive tokens.

Handle:

* loading states
* validation
* API errors
* incorrect password
* unverified email
* expired session
* network errors

Do not store passwords locally.

---

# 8. HOME SCREEN

Create a personalized dashboard.

Example:

"Good evening, Collector"

Display:

* number of collection items
* categories
* recently added
* recently identified objects
* marketplace recommendations
* active requests
* AI assistant shortcut

Example sections:

My Collection
1,284 objects

Recently Added

AI Discoveries

Marketplace

Requests

Do not overload the screen.

Prioritize visual object photography.

---

# 9. COLLECTION

Create a powerful collection management system.

Main screen:

"My Collection"

Features:

* search
* filters
* sorting
* category filter
* year filter
* country filter
* material filter
* favorites
* recently added
* grid/list toggle

Object cards should emphasize:

* image
* title
* year
* category
* country
* collection ID

Example:

5 Rubles
1921
Russia
Silver

COL-00421

---

# 10. COLLECTION ITEM DETAILS

Create a beautiful detail page.

Display:

* large image gallery
* title
* category
* country
* year
* material
* dimensions
* weight
* condition
* rarity
* description
* historical information
* provenance
* personal notes
* purchase information
* estimated value if available
* sources
* AI identification information

Actions:

* Edit
* Add photos
* Favorite
* Share
* Delete
* Ask AI about this item

If information comes from external sources, clearly show the sources.

---

# 11. SCAN / AI IDENTIFICATION

This is one of the most important features.

Create a dedicated Scan screen.

User can:

* take photo
* select photo from gallery
* upload multiple photos

For coins encourage:

* front
* back
* edge

For other objects allow:

* multiple angles
* close-up
* details

Show a beautiful analysis animation.

Example:

Analyzing object...

Then show progress stages:

1. Reading image
2. Searching collection
3. Searching catalog
4. Comparing similar objects
5. Checking sources

Do not fake progress.

Use real API states when available.

---

# 12. AI IDENTIFICATION PIPELINE

The mobile application should NOT perform expensive AI logic itself.

Backend should handle it.

Expected architecture:

Image
↓
Internal database search
↓
Vector/image similarity search
↓
Candidate matching
↓
AI verification
↓
If insufficient result:
Web search
↓
Sources
↓
Final response

The mobile app should display the result cleanly.

Example:

Possible match

5 Rubles
1921
Russia
Silver

Match confidence:
91%

Why:

✓ Year matches
✓ Nominal matches
✓ Design matches
✓ Reverse side matches

Possible discrepancy:

Mint mark is unclear.

---

# 13. MULTIPLE CANDIDATES

If AI finds multiple possibilities, show them.

Example:

Possible matches

1. 5 Rubles 1921
   91%

2. 5 Rubles 1922
   73%

3. 10 Rubles 1921
   61%

Allow user to select:

"This is my item"

or:

"None of these"

---

# 14. USER FEEDBACK

If user says:

"No, this is not my object"

do NOT delete the catalog object.

The system should record feedback:

rejected candidate

and continue searching.

The UI should allow:

* Try again
* Upload better photo
* Search internet
* Enter description manually

The backend should learn from feedback where appropriate.

---

# 15. WEB SEARCH

If the internal database cannot confidently identify the object:

show:

"We couldn't find a confident match in our collection database."

Then allow backend to search external sources.

When web search succeeds, show:

Found from external sources

Source 1
Source 2
Source 3

Each source should have:

* title
* domain
* short description
* date if available
* open source button

Do not present web information as verified fact without attribution.

---

# 16. AI ASSISTANT

Create a dedicated AI Assistant screen.

It should look like a premium conversational assistant.

The assistant must be collection-aware.

Example user question:

"Do I have a 5 rubles coin from 1921?"

Assistant should search the user's collection first.

Example response:

"Yes. You have one."

Then:

5 Rubles
1921
ID: COL-00421

Tap to open.

Another question:

"How many Russian silver coins do I have?"

Assistant should query the database and return the actual result.

The AI must NOT invent collection data.

---

# 17. ASSISTANT TOOL ARCHITECTURE

Backend should eventually expose tools such as:

searchMyCollection()
getCollectionItem()
searchCatalog()
findSimilarItems()
searchSources()
searchWeb()
getCollectionStatistics()

The assistant should call tools instead of guessing.

Natural language:

"Do I have a 5 rubles 1921?"

should become a database query.

Natural language:

"Show me all Arabic coins before 1900."

should become filters/search.

Natural language:

"Tell me everything about this coin."

should retrieve the actual object first and then generate an explanation.

---

# 18. MARKETPLACE

Add a full marketplace.

The user should be able to:

* buy
* sell
* inspect/appraise
* browse listings
* create listing
* create purchase request
* create inspection request

Main marketplace tabs:

Buy
Sell
Requests

Potentially:

All
Coins
Art
Watches
Weapons
Books
Other

---

# 19. SELL ITEM

Create "Sell an Item" flow.

Step 1:

Select object from collection OR create new object.

Step 2:

Upload photos.

Step 3:

Title.

Step 4:

Description.

Step 5:

Category.

Step 6:

Year.

Step 7:

Country.

Step 8:

Condition.

Step 9:

Price.

Allow:

* fixed price
* negotiable
* auction later if backend supports it

Step 10:

Location.

Step 11:

Contact preferences.

Preview listing.

Publish.

---

# 20. BUY REQUEST

Allow users to create:

"I want to buy"

Request fields:

* category
* object
* preferred year
* country
* condition
* budget
* description
* photos/reference images

Example:

Looking for:

5 Rubles
1921
Silver
Budget: $500

The system can notify sellers when appropriate.

---

# 21. INSPECTION / APPRAISAL REQUEST

Add:

"Request Inspection"

User can upload:

* photos
* video
* description
* category
* object details

Request statuses:

Pending
Received
In Review
Need More Information
Completed
Rejected

Show request history.

---

# 22. MARKETPLACE LISTING DETAILS

Listing page:

* image gallery
* title
* seller
* category
* year
* country
* condition
* price
* description
* AI identification if available
* sources
* location
* seller information
* request inspection button
* contact seller button
* buy/request button

Do not expose private user information unnecessarily.

---

# 23. REQUESTS CENTER

Create a central request page.

User should see:

My purchases
My sales
Inspection requests
Buy requests
Sell requests

Statuses must be visually clear.

Example:

Pending
In Review
Approved
Rejected
Completed

---

# 24. NOTIFICATIONS

Implement push notification architecture.

Notifications for:

* email verification
* identification completed
* seller response
* buyer response
* marketplace request
* inspection status
* AI analysis completed
* new marketplace activity

Use Expo Notifications where appropriate.

---

# 25. PROFILE

Profile page:

* avatar
* name
* email
* collector categories
* collection statistics
* account settings
* notification settings
* privacy
* language
* theme
* logout

Collection statistics:

* total objects
* categories
* countries
* years
* most collected category

---

# 26. SEARCH

Global search should support:

* collection
* catalog
* marketplace
* categories

Search should support natural language where backend supports it.

Examples:

"5 rubles 1921"

"Russian silver coins"

"Arabic coins before 1900"

"paintings from Uzbekistan"

---

# 27. PERFORMANCE

The application must be production-oriented.

Use:

* TanStack Query caching
* pagination
* infinite scrolling where appropriate
* image caching
* lazy loading
* optimistic updates where safe
* debounced search
* skeleton loaders
* retry handling
* offline-friendly cached screens

Do not fetch entire collections at once.

Use pagination.

---

# 28. ERROR STATES

Every important screen needs:

* loading state
* empty state
* error state
* retry action

Examples:

"No objects in your collection yet."

"Take your first photo to identify an object."

"No marketplace listings found."

"We couldn't identify this object."

Do not leave blank screens.

---

# 29. DESIGN SYSTEM

Create a reusable component system.

At minimum:

Button
IconButton
TextInput
SearchInput
Card
Badge
Chip
Avatar
BottomSheet
Modal
Tabs
SegmentedControl
ImageGallery
ObjectCard
MarketplaceCard
SourceCard
AIMessage
UserMessage
LoadingSkeleton
EmptyState
ErrorState
ScreenHeader
SectionHeader
FilterSheet

```

Use consistent tokens everywhere.

No random styling per screen.

---

# 30. ACCESSIBILITY

Support:

- dynamic font scaling
- readable contrast
- accessible touch targets
- screen reader labels
- reduced motion where possible

---

# 31. SECURITY

Never put:

- AI API keys
- database credentials
- Telegram bot token
- secret API keys

inside the React Native application.

All secrets stay on the backend.

Use secure authentication.

Do not trust client-side permissions.

---

# 32. API LAYER

Create a centralized API client.

Example:

src/shared/api/

authApi
collectionApi
catalogApi
identificationApi
marketplaceApi
requestsApi
assistantApi
profileApi
notificationsApi

Do not scatter fetch/axios calls throughout components.

Use TanStack Query.

---

# 33. TYPES

Create shared TypeScript types/interfaces for:

User
Category
CatalogItem
CollectionItem
IdentificationRequest
IdentificationResult
IdentificationCandidate
MarketplaceListing
PurchaseRequest
SaleRequest
InspectionRequest
Source
AssistantMessage
Notification

Avoid `any`.

---

# 34. ARCHITECTURE

Use a clean FSD-like architecture.

Suggested:

src/
  app/
  pages/
  widgets/
  features/
  entities/
  shared/

Do not create one giant component.

Separate:

UI
state
API
business logic
types

Keep components small and reusable.

---

# 35. MOBILE ROUTING

Create routes for:

/onboarding

/auth/login
/auth/register
/auth/verify-email
/auth/forgot-password
/auth/reset-password

/home

/collection
/collection/[id]

/scan
/scan/result/[id]

/marketplace
/marketplace/[id]
/marketplace/create-sale
/marketplace/create-buy-request

/requests
/requests/[id]

/assistant

/profile
/settings

Protect authenticated routes.

---

# 36. BACKEND COMPATIBILITY

Before writing mock API logic, inspect the existing backend.

If an API already exists:

USE IT.

If an endpoint does not exist:

document the expected endpoint and implement the client abstraction cleanly.

Do not create fake production data and pretend it is real.

For UI development, temporary mock data may be used only behind a clearly isolated development/mock layer.

---

# 37. ENVIRONMENT

Create:

.env.example

with variables such as:

EXPO_PUBLIC_API_URL=

Do not commit secrets.

Document how to run:

npm install
npx expo start

and how to run:

iOS
Android

---

# 38. QUALITY REQUIREMENTS

The result must:

- compile
- have no TypeScript errors
- have no obvious runtime errors
- have clean navigation
- work on Android
- work on iOS
- use reusable components
- have proper loading/error/empty states
- have polished UI
- avoid placeholder-looking screens
- avoid duplicated code
- avoid unnecessary dependencies

Run type checking and linting before finishing.

Fix errors rather than simply reporting them.

---

# 39. IMPORTANT PRODUCT RULE

Do NOT build only the UI.

Build the real application foundation.

The architecture must make it possible to connect:

Telegram Bot
Mobile App
Backend
PostgreSQL
Redis
Object Storage
AI
Vector Search
Web Search
Marketplace

into one ecosystem.

---

# 40. DEVELOPMENT ORDER

Work in this order:

1. Inspect repository.
2. Understand existing backend/API/database.
3. Create React Native mobile application structure.
4. Create design system.
5. Implement authentication.
6. Implement onboarding.
7. Implement Home.
8. Implement Collection.
9. Implement Item Details.
10. Implement Scan UI and API integration.
11. Implement AI identification result UI.
12. Implement AI Assistant.
13. Implement Marketplace.
14. Implement Buy/Sell/Inspection requests.
15. Implement Profile.
16. Implement Notifications architecture.
17. Implement loading/error/empty states.
18. Optimize performance.
19. Run TypeScript checks.
20. Run lint.
21. Fix all errors.
22. Provide final implementation summary.

---

# 41. IMPORTANT UX RULE

The user should always understand:

"What can I do here?"

The primary actions should be obvious.

The most important actions are:

SCAN OBJECT
MY COLLECTION
ASK AI
BUY
SELL
REQUEST INSPECTION

Do not bury these features inside menus.

---

# 42. FINAL RESULT

At the end, provide:

1. Project structure.
2. Technologies used.
3. Screens implemented.
4. API integrations used.
5. Existing backend functionality reused.
6. New backend endpoints required.
7. Environment variables required.
8. Commands to run iOS.
9. Commands to run Android.
10. Known limitations.
11. Recommended next development steps.

Most importantly:

**Do not stop after creating screens.**

Build the application foundation so it is ready to connect to the real Antique backend and become a production application.

Make reasonable technical decisions yourself without constantly asking for confirmation.

Prioritize:

UX
performance
maintainability
security
AI token efficiency
reusability
and a premium collector-focused visual experience.
```
