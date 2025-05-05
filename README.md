# SuiTale

Web app for creating, publishing, and reading rich content on the Sui blockchain using Walrus network for content storage.

## Project Structure

```
src/
  ├── frontend/             # React frontend
  │   ├── api/              # API clients
  │   ├── components/       # React components
  │   ├── hooks/            # Custom React hooks
  │   ├── pages/            # Page components
  │   └── providers/        # Context providers
  │
  ├── backend/              # NestJS backend
  │   ├── main.ts           # Entry point
  │   ├── app.module.ts     # Root module
  │   └── modules/          # Feature modules
  │       ├── tales/        # Tales module
  │       │   ├── controllers/  # API controllers
  │       │   ├── services/     # Business logic
  │       │   ├── dto/          # Data Transfer Objects
  │       │   └── schemas/      # MongoDB schemas
  │       └── walrus/       # Walrus module
  │           └── services/     # Walrus integration
  │
  └── types/                # Shared TypeScript types
```

## Technology Stack

### Backend

- **NestJS**: A progressive Node.js framework for building efficient server-side applications
- **MongoDB**: Document database for storing tale metadata
- **Mongoose**: ODM for MongoDB
- **Walrus SDK**: For decentralized storage on the Sui blockchain
- **Swagger**: API documentation

### Frontend

- **React**: UI library
- **TypeScript**: For type safety
- **React Query**: Data fetching and state management
- **Material UI**: Component library
- **TipTap**: Rich text editor
- **Notistack**: Toast notifications

## Setup & Running

### Backend

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the `src/backend` directory:
   ```
   PORT=3001
   MONGODB_URI=mongodb://localhost/suitale
   WALRUS_NETWORK=testnet
   SUI_PRIVATE_KEY=your_private_key_here
   ```

3. Start the development server:
   ```
   npm run start:backend:dev
   ```

   The server will run at http://localhost:3001 with API documentation at http://localhost:3001/api/docs

### Frontend

1. Install dependencies (if you haven't already):
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run frontend
   ```

   The app will run at http://localhost:3000

## Key Features

- **Rich Text Editing**: WYSIWYG editor with formatting and media embedding
- **Decentralized Storage**: Content stored on Walrus network
- **Metadata Management**: Title, description, tags, cover image
- **Reading Stats**: Word count and reading time
- **Content Distribution**: Publish and share tales

## API Endpoints

- `POST /api/tales` - Create a new tale
- `GET /api/tales/:id` - Get a tale by ID
- `GET /api/tales/:id/full` - Get a tale with full content
- `GET /api/tales` - List tales (with pagination)
- `PUT /api/tales/:id` - Update a tale
- `DELETE /api/tales/:id` - Delete a tale
- `POST /api/tales/upload/cover` - Upload a cover image

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3001
WALRUS_NETWORK=testnet
SUI_PRIVATE_KEY=your_private_key  # Only for development, use secure methods in production
```

## Walrus Integration

Tales are stored on the Walrus network, a decentralized storage solution built on Sui blockchain. The content of each tale is stored as a blob, and its identifier is saved in the tale's metadata.
