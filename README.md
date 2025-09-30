# Reading Tracker App

A comprehensive CRUD application for tracking books and organizing them into collections, built with Next.js 15, TypeScript, TailwindCSS, HeadlessUI, and HeroIcons.

## Features

### Books Management
- ✅ Add, view, edit, and delete books
- ✅ Track book details: Title, Author, Review, Rating (0-5), Status, Collection
- ✅ Book statuses: TBR (To Be Read), Reading, Read, DNF (Did Not Finish), On Hold
- ✅ Individual book view page with detailed information
- ✅ Quick status and collection changes from the books list

### Collections Management
- ✅ Create, edit, and delete collections from the dashboard
- ✅ Move books between collections
- ✅ Default "My Books" collection for new databases
- ✅ Automatic book reassignment when deleting collections
- ✅ Integrated collection management in dashboard view

### Database Management
- ✅ Unique link-based access (no login required)
- ✅ Each database has a unique ID accessible via localhost:3000/{database-id}
- ✅ Data persistence using localStorage
- ✅ Automatic database creation for new users

### Dashboard & Analytics
- ✅ Overview statistics: total books, collections count, reading status breakdown
- ✅ Collections management with add/edit/delete functionality
- ✅ Reading status distribution
- ✅ Integrated collection cards with book counts

### User Interface
- ✅ Responsive design with TailwindCSS
- ✅ Sortable table headers (Title, Author, Rating, Status, Collection)
- ✅ Filtering by status and collection
- ✅ Modal forms for adding/editing books and collections
- ✅ Streamlined navigation: Dashboard and Books pages
- ✅ Integrated collection management in dashboard

## Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: HeadlessUI
- **Icons**: HeroIcons
- **Data Storage**: localStorage (client-side)
- **Routing**: Dynamic routes for database IDs

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

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

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### First Time Setup
1. Visit `localhost:3000`
2. The app will automatically create a new database and redirect you to `localhost:3000/{unique-id}`
3. Bookmark this URL as your personal reading tracker

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

### Managing Collections
1. Navigate to the Dashboard
2. Scroll to the Collections section
3. Click "Add Collection" to create new collections
4. Use the edit (pencil) icon to modify existing collections
5. Use the delete (trash) icon to remove collections (books will be moved to another collection)
6. Each collection shows its title, description, book count, and creation date

### Viewing and Editing Books
1. Click on any book title to view full details
2. Use the Books list to quickly change status or collection
3. Filter and sort books using the controls at the top of the Books page
4. Edit or delete books using the action buttons

### Data Persistence
- All data is stored in your browser's localStorage
- Each database ID maintains separate data
- Data persists between browser sessions
- No server-side storage or user accounts required

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [dbId]/            # Dynamic database routes
│   │   ├── page.tsx       # Dashboard with collections management
│   │   └── books/         # Books pages
│   │       ├── page.tsx   # Books list
│   │       └── [bookId]/  # Individual book view
│   └── page.tsx           # Home page (redirects to new DB)
├── components/            # Reusable React components
│   ├── Layout.tsx         # Main layout with navigation
│   ├── BookForm.tsx       # Book add/edit modal
│   └── CollectionForm.tsx # Collection add/edit modal
├── services/              # Business logic
│   └── dataService.ts     # Data management and localStorage
└── types/                 # TypeScript type definitions
    └── index.ts           # App-wide interfaces
```

## Default Data Structure

### Book Object
```typescript
interface Book {
  id: string;
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
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
