# Unify

CodePath WEB103 Final Project

Designed and developed by: David Odejimi, Fatma Elmadani, Wanyi Ng, Daniel Zhong, Diana Gómez, Hevander da Costa

🔗 Link to deployed app: https://unify-web.onrender.com/

## About

### Description and Purpose

Unify is a full-stack web application that helps people discover, create, and join local events based on their interests. Whether users are looking for networking opportunities, fitness groups, study sessions, social gatherings, or hobby meetups, the platform makes it easy to connect with others and build meaningful communities. Users can browse upcoming events, RSVP, manage the events they organize, and keep track of the events they plan to attend.

### Inspiration

Our group drew inspiration from popular event platforms like Meetup, along with our own experiences trying to organize study groups, networking events, and social gatherings. We wanted to create a streamlined platform where users can easily find events, create their own, and connect with people who share similar interests without unnecessary complexity.

## Tech Stack

Frontend: React

Backend: Express.js

Database: PostgreSQL

## Features

### ✅ User registration

To browse and join local events, users need to create an account with their email.

##### Without Github & Google OAuth authentication
<img src='./planning/Gif Pics/User Registration (Without GithubGoogle OAuth).gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

##### With Github & Google OAuth authentication
<img src='./planning/Gif Pics/Github Google Auth Login & SignUp.gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ Event creation

Users can create a new event with a name, description, date, location, and category so others can discover and join it.

<img src='./planning/Gif Pics/Edit Event Page.gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ Event browsing

Users can view a list of upcoming events to discover things happening near them.

<img src='./planning/Gif Pics/Event Browsing (Not Completed).gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ Category filtering

Users can filter events by category to quickly find ones that match their interests.

<img src='./planning/Gif Pics/Category Filtering Completed.gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ Keyword search

Users can search for events by keyword to find a specific event they already have in mind.

<img src='./planning/Gif Pics/Keyword Search.gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ Event details view

Users can view an event's full details, including time, location, and description, to decide whether to attend.

<img src='./planning/Gif Pics/Event details view.gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ RSVP

Users can RSVP to an event to secure their spot and let the organizer know they're coming.

<img src='./planning/Gif Pics/RSVP.gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ RSVP cancellation

Users can cancel their RSVP to free up their spot if their plans change.

<img src='./planning/Gif Pics/Cancel RSVP.gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ Attendee Count
    
Users can see how many people are attending an event to gauge its size and popularity before joining.

<img src='./planning/Gif Pics/Attandee Count.gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ Event editing

Users can edit the details of an event they created to keep attendees informed with accurate information.

<img src='./planning/Gif Pics/Edit Event Page.gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ Event deletion

Users can delete an event they created to notify attendees if it's no longer happening.

<img src='./planning/Gif Pics/Delete Event.gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ Attendee list

Users can view the list of attendees for their event to plan accordingly for capacity or supplies.

<img src='./planning/Gif Pics/Show Attendee List.gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ Profile dashboard

Users can view a profile page showing the events they're organizing and the ones they've RSVP'd to, so they can track their activity in one place.

<img src='./planning/Gif Pics/Profile Dashboard Edit Profile.gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ Landing Page

Before A user login/sign up they see the landing page showing what the applications is about.

<img src='./planning/Gif Pics/Landing Page.gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ Homepage Dashboard

When a user login/sign up it shows a personalized homepage dashboard about their data and recommendations.

<img src='./planning/Gif Pics/Home dashboard (Personalized).gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

### ✅ Public Profile Page
When a user want to check out another user or the person who organized this event to see if they have organized other events or their interest.

<img src='./planning/Gif Pics/Public Profile User Page.gif' title='Video Walkthrough' width='800' alt='Video Walkthrough' />

## Installation Instructions

### 1. Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL (local instance or hosted DB)

### 2. Clone and install dependencies

```bash
git clone <your-repo-url>
cd Unify
npm install
```

### 3. Create environment file

Create a file at `server/.env` with the following values:

```env
# App
PORT=3001

# PostgreSQL
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGHOST=localhost
PGPORT=5432
PGDATABASE=unify

# Auth
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d

# Optional OAuth (GitHub)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:5173/login

# Optional OAuth (Google)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5173/login
```

Notes:
- OAuth is optional for local development. Email/password auth works without OAuth values.
- If your frontend needs a custom API URL, add `VITE_API_BASE_URL=http://localhost:3001` in a root `.env` file.

### 4. Initialize/reset the database

This project includes a reset/seed script.

```bash
npm run reset -- --force
```

### 5. Run the app

From the project root:

```bash
npm run dev
```

This starts:
- Express API on `http://localhost:3001`
- Vite frontend on `http://localhost:5173`

### 6. Build for production

```bash
npm run build
```

## Deploy on Render

This repo includes a Render blueprint at [render.yaml](render.yaml) for deploying both services:
- Backend API (`unify-api`)
- Frontend static site (`unify-web`)

Full step-by-step instructions are in [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md).
