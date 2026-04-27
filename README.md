# BookHub Frontend

A single-page React application for managing and discovering books. Users can browse books, leave reviews, and manage personal reading lists. Administrators have access to additional CRUD pages for managing books, authors, genres, and users.

The frontend consumes the BookHub .NET Core backend API, which handles authentication and all data persistence.

## Live Demo

The application is deployed on Netlify and available at **[https://cp-bookhub.netlify.app/](https://cp-bookhub.netlify.app/)**. It is wired to the deployed backend API, so you can register an account and use all features without running anything locally.

> Note: the backend is hosted on Render's free tier, which spins down when idle. The first request after a period of inactivity may take 30–60 seconds while the API cold-starts.

---

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A running instance of the BookHub backend API (local or deployed)

---

## Environment Setup

Create a `.env` file in the project root. A single variable is required:

```
REACT_APP_API_URL=https://your-api-url.com
```

For local development against a locally running API:

```
REACT_APP_API_URL=http://localhost:5000
```

The deployed backend is available at `https://bookhub-7cs4.onrender.com` and can be used directly if you do not want to run the API locally. If you prefer to run the API yourself, the source code is available at https://github.com/c-phillips7/BookHubApi.

---

## Installation

Install dependencies:

```
npm install
```

---

## Running the App

Start the development server:

```
npm start
```

The app will open at `http://localhost:3000`.

---

## Running Tests

Run the full test suite:

```
npm test
```

To run once without watch mode:

```
npm test -- --watchAll=false
```

---

## Building for Production

```
npm run build
```

The optimised output is written to the `build/` folder and can be served by any static hosting provider such as Netlify.

---

## Features

- Browse and search books with pagination
- User registration, login, and JWT-based authentication
- Leave and delete reviews on books (one review per user per book)
- Create and manage personal reading lists with public/private visibility
- View public profiles, reading lists, and reviews for any user
- Admin-only panel for full CRUD management of books, authors, genres, and users
- Role-based route protection using React Context and JWT decoding

---

## Project Structure

```
src/
  components/       Shared reusable components (Navbar, Pagination, SearchBar, etc.)
  context/          AuthContext - global authentication state
  pages/            One file per page/view
    adminPages/     Admin-only CRUD pages
  services/         Axios instance with JWT auto-injection
```
