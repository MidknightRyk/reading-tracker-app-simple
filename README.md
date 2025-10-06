# Reading Tracker App

A comprehensive CRUD application for tracking books and organizing them into collections, built with Next.js 15, TypeScript, TailwindCSS, HeadlessUI, HeroIcons, and MongoDB.

## Features

### Books Management
- ✅ Add, view, edit, and delete books
- ✅ Track book details: Title, Author, Review, Rating (0-5), Status, Collection
- ✅ Book statuses: TBR (To Be Read), Reading, Read, DNF (Did Not Finish), On Hold
- ✅ Individual book view page with detailed information
- ✅ Quick status and collection changes from the books list
- ✅ Comprehensive loading states with visual feedback for all operations

### Collections Management
- ✅ Create, edit, and delete collections from the dashboard
- ✅ Move books between collections
- ✅ Default "My Books" collection for new databases
- ✅ Automatic book reassignment when deleting collections
- ✅ Integrated collection management in dashboard view
- ✅ Loading states for collection operations

### Database Management
- ✅ Unique link-based access (no login required)
- ✅ Each database has a unique ID accessible via localhost:3000/{database-id}
- ✅ MongoDB Atlas cloud storage for reliable data persistence
- ✅ Automatic database creation for new users
- ✅ Smart database ID display with dynamic formatting for different ID lengths
- ✅ Copy-to-clipboard functionality for database IDs

### Dashboard & Analytics
- ✅ Overview statistics: total books, collections count, reading status breakdown
- ✅ Collections management with add/edit/delete functionality
- ✅ Reading status distribution
- ✅ Integrated collection cards with book counts
- ✅ Real-time data updates with loading indicators

### User Interface
- ✅ Responsive design with TailwindCSS
- ✅ Dark mode support with theme toggle
- ✅ Professional loading components replacing content during operations
- ✅ Sortable table headers (Title, Author, Rating, Status, Collection)
- ✅ Filtering by status and collection
- ✅ Modal forms for adding/editing books and collections
- ✅ Streamlined navigation: Dashboard and Books pages
- ✅ Integrated collection management in dashboard
- ✅ Optimized loading states preventing UI blocking

## Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: MongoDB Atlas (cloud-hosted)
- **Styling**: TailwindCSS
- **UI Components**: HeadlessUI
- **Icons**: HeroIcons
- **HTTP Client**: Axios for API requests
- **Routing**: Dynamic routes for database IDs
- **Development**: Turbopack for fast development builds

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd reading-tracker-app-simple
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local` (if available)
   - Or create `.env.local` with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reading-tracker?retryWrites=true&w=majority
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### First Time Setup
1. Visit `localhost:3000`
2. The app will automatically create a new database and redirect you to `localhost:3000/{unique-id}`
3. Bookmark this URL as your personal reading tracker
4. Use the copy button next to the database ID in the header to save your unique link

### Adding Books
1. Navigate to the Books page
2. Click "Add Book"
3. Fill in the required fields:
   - Title (Required)
   - Author (Required)
   - Rating 0-5 (Required) 
   - Status (Required, defaults to TBR)
   - Collection (Required, defaults to "My Books")
   - Review (Optional)
4. The app will show a loading indicator while saving

### Managing Collections
1. Navigate to the Dashboard
2. Scroll to the Collections section
3. Click "Add Collection" to create new collections
4. Use the edit (pencil) icon to modify existing collections
5. Use the delete (trash) icon to remove collections (books will be moved to another collection)
6. Each collection shows its title, description, book count, and creation date
7. All operations show loading states for better user feedback

### Viewing and Editing Books
1. Click on any book title to view full details
2. Use the Books list to quickly change status or collection
3. Filter and sort books using the controls at the top of the Books page
4. Edit or delete books using the action buttons
5. Loading indicators show progress for all operations

### Data Persistence
- All data is stored securely in MongoDB Atlas cloud database
- Each database ID maintains separate data collections
- Data persists across devices and browser sessions
- Automatic backup and reliability through MongoDB Atlas
- No user accounts required - access via unique database ID

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [dbId]/            # Dynamic database routes
│   │   ├── page.tsx       # Dashboard with collections management
│   │   └── books/         # Books pages
│   │       ├── page.tsx   # Books list with loading states
│   │       └── [bookId]/  # Individual book view
│   ├── api/               # Next.js API routes
│   │   ├── books/         # Books CRUD operations
│   │   ├── collections/   # Collections CRUD operations
│   │   └── test/          # Database connection testing
│   └── page.tsx           # Home page (redirects to new DB)
├── components/            # Reusable React components
│   ├── Layout.tsx         # Main layout with navigation and theme toggle
│   ├── BookForm.tsx       # Book add/edit modal
│   ├── CollectionForm.tsx # Collection add/edit modal
│   ├── CollectionsManagementModal.tsx # Collections management interface
│   ├── Loading.tsx        # Professional loading component
│   ├── StyledDropdown.tsx # Custom dropdown component
│   └── ThemeToggle.tsx    # Dark/light mode toggle
├── contexts/              # React contexts
│   └── ThemeContext.tsx   # Theme management context
├── lib/                   # Utility libraries
│   ├── constants.ts       # App constants and configurations
│   └── mongodb.ts         # MongoDB connection and client setup
├── services/              # Business logic and data services
│   ├── dataService.ts     # Legacy localStorage service
│   └── mongoDataService.ts # MongoDB data operations
└── types/                 # TypeScript type definitions
    ├── index.ts           # App-wide interfaces
    └── css.d.ts           # CSS module declarations
```

## Key Components

### Loading System
- **Loading.tsx**: Professional loading component with customizable sizes (sm/md/lg)
- Content replacement strategy instead of button spinners
- Consistent loading states across all operations
- Dark mode support with spinning icons

### Data Services
- **mongoDataService.ts**: MongoDB operations with proper error handling
- **dataService.ts**: Legacy localStorage fallback
- **mongodb.ts**: Database connection management with connection pooling

### Theme System
- **ThemeContext.tsx**: Global theme state management
- **ThemeToggle.tsx**: User-friendly theme switching
- Persistent theme preferences
- Full dark mode support across all components

## Default Data Structure

### Book Object
```typescript
interface Book {
  _id?: string; // MongoDB ObjectId
  id: string;   // Application ID
  title: string;
  author: string;
  review?: string;
  rating: number; // 0-5
  status: 'TBR' | 'Reading' | 'Read' | 'DNF' | 'On Hold';
  collectionId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Collection Object
```typescript
interface Collection {
  _id?: string; // MongoDB ObjectId
  id: string;   // Application ID
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Structure
Each database ID corresponds to separate MongoDB collections:
- `books_{dbId}`: Stores all books for the database
- `collections_{dbId}`: Stores all collections for the database

## Environment Variables

Required environment variables in `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reading-tracker?retryWrites=true&w=majority
```

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build with Turbopack
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check
```

## Recent Updates & Improvements

### MongoDB Integration (Latest)
- ✅ Migrated from localStorage to MongoDB Atlas cloud storage
- ✅ Reliable data persistence across devices and sessions
- ✅ Proper ObjectId handling and validation in API routes
- ✅ Connection pooling and optimized database performance
- ✅ Automatic database and collection creation

### Loading States & UX (Latest)
- ✅ Professional Loading component with spinning animations
- ✅ Content replacement loading strategy (better than button spinners)
- ✅ Granular loading states for every operation (add, edit, delete)
- ✅ Consistent loading experience across all pages
- ✅ Loading indicators for initial data fetching

### UI/UX Enhancements (Latest)
- ✅ Dark mode support with persistent theme preferences
- ✅ Smart database ID formatting (prevents character overlap)
- ✅ Copy-to-clipboard functionality for database IDs
- ✅ Responsive design improvements
- ✅ Better error handling and user feedback

### Performance Optimizations
- ✅ Turbopack integration for faster development builds
- ✅ Optimized API routes with proper error handling
- ✅ Efficient MongoDB queries and operations
- ✅ Reduced redundant API calls with proper loading states

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use the established loading state patterns
- Ensure dark mode compatibility for new components
- Test with both short and long database IDs
- Add proper error handling for MongoDB operations

## License

This project is licensed under the MIT License - see the LICENSE file for details.
