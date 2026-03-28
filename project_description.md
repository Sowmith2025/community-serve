# Boosting Student Engagement in Community Service

## 1. Abstract
The "Boosting Student Engagement in Community Service" project is a full-stack web application designed to connect students with meaningful community service opportunities. The platform operates on a dual-role system where "Organizers" can seamlessly create and manage volunteering events, while "Students" can browse, register, and track their community contributions. By providing an intuitive user interface and a robust, secure backend, the application aims to foster civic engagement, simplify the logistics of volunteer coordination, and encourage a culture of giving back among the student body.

## 2. Project Workflow
The general flow of the application focuses on connecting event organizers with student volunteers:

1. **Registration & Authentication**: Users sign up as either a "Student" or an "Organizer". The system authenticates them via credentials and issues a secure JSON Web Token (JWT) for subsequent requests.
2. **Event Management (Organizers)**: Organizers use a dedicated interface to create new community service events. They define the title, description, date, and location of the event. They can also view their past and upcoming events.
3. **Event Discovery (Students)**: Students log in to their dashboard where they can see a feed of all upcoming community service events.
4. **Registration & Tracking (Students)**: A student can click on an event to view its details and register. The dashboard keeps track of all events the student has committed to.

## 3. Tech Stack
- **Frontend**: React (built with Vite), React Router DOM (Navigation), Axios (API Client), Tailwind / Vanilla CSS (Styling), Lucide React (Icons), Framer Motion (Animations).
- **Backend**: Java 21, Spring Boot 3.x (Spring Web, Spring Data JPA, Spring Security).
- **Database**: MySQL.
- **Security**: JWT (JSON Web Tokens) for stateless authentication.

## 4. Code Description and Structure

### Backend (`backend-java`)
The backend is a robust REST API built on the Spring Boot framework, following the standard Controller-Service-Repository architecture.

* **Models (Entities)**
  * `User`: Represents both Organizers and Students. Stores credentials, email, name, and their specific role.
  * `Event`: Represents a community service opportunity. Stores the title, description, date/time, location, and maps to the Organizer who created it.
  * `Registration`: A mapping entity that links a Student to a specific Event they signed up for.

* **Controllers**
  * `AuthController`: Exposes the `/api/auth/register` and `/api/auth/login` endpoints. Handles password hashing and issues the JWT upon successful login.
  * `EventController`: Provides CRUD (Create, Read, Update, Delete) operations for events. It also handles the endpoint for students to register for an event (e.g., `/api/events/{id}/register`).
  * `UserController` & `OrganizerController`: Provide role-specific endpoints (like fetching dashboard stats or profile data).

* **Security & Configuration**
  * Uses Spring Security with a custom JWT Filter. The filter intercepts incoming HTTP requests, extracts the `Bearer` token from the headers, validates it, and sets the authenticated user in the Spring Security Context.

### Frontend (`frontend-react`)
The frontend is a Single Page Application (SPA) built with React, ensuring a dynamic and fast user experience.

* **State Management & API**
  * `AuthContext.jsx`: A React Context provider that manages the global authentication state. It handles logging in, logging out, parsing user data, and persisting the JWT token in `localStorage`.
  * `api.js`: A centralized Axios instance. It configures a request interceptor that automatically attaches the user's JWT `Bearer` token to the `Authorization` header for all protected API calls.

* **Pages**
  * `Home.jsx`: The landing page introducing the platform's mission.
  * `Login.jsx` & `Register.jsx`: Forms for user authentication. They communicate with the backend's `AuthController` and update the `AuthContext` upon success.
  * `Dashboard.jsx`: The main hub after logging in. It renders conditionally based on the user's role: displaying a feed of available events to students and showing managed events to organizers.
  * `EventDetails.jsx`: A specific page for examining a single event in depth. Allows students to formally register for the selected event.
  * `EventForm.jsx`: A dedicated form allowing Organizers to post new events to the platform or edit existing ones.

* **Components**
  * `Navbar.jsx`: The top navigation bar that conditionally displays links (like Login, Dashboard, Logout) based on the user's current authentication status.

## 5. SDLC Model Followed

### Model: Agile (Iterative & Incremental Development)

This project follows the **Agile Software Development Life Cycle (SDLC)**, specifically an **Iterative and Incremental** approach. Rather than delivering the entire system in one go, the application was built and refined in short, repeated cycles — with each cycle adding or improving a functional slice of the product.

---

### Phases & How They Map to This Project

| SDLC Phase | Project Activity |
|---|---|
| **1. Planning** | Defined dual-role system (Student / Organizer), identified core features (auth, event CRUD, registration), and chose the tech stack (React + Spring Boot + MySQL). |
| **2. Requirements Analysis** | Captured user stories: students need to discover & register for events; organizers need to create & manage events. Role-based access requirements were defined upfront. |
| **3. System Design** | Designed the database schema (Users, Events, Registrations), REST API contract (endpoints per controller), and the React component/page structure (SPA with React Router). |
| **4. Implementation (Sprints)** | Development was split across iterative cycles: *(a)* Backend entities + repositories → *(b)* Auth (JWT) → *(c)* Event CRUD APIs → *(d)* React pages & routing → *(e)* API integration with Axios. |
| **5. Testing & Debugging** | Each feature was tested immediately after implementation. Bugs in CORS, JWT validation, and API communication were identified and fixed iteratively across multiple sessions. |
| **6. Deployment** | The application was pushed to GitHub and deployed incrementally, with fixes applied in subsequent iterations without rebuilding from scratch. |
| **7. Maintenance** | Post-deployment debugging cycles addressed runtime errors and integration issues between the frontend and backend. |

---

### Why Agile (and Not Waterfall)?

| Criterion | Agile ✅ | Waterfall ❌ |
|---|---|---|
| Development style | Features built and tested in parallel increments | All design done before any coding |
| Flexibility | Frontend and backend evolved together, adapting as issues emerged | Changes between phases are costly and discouraged |
| Feedback loops | Bugs fixed immediately across short cycles | Testing only happens near the end |
| Deployment | Deployed early to GitHub; refined iteratively | Deployed only once, after full completion |
| Team collaboration | Frontend (React) and Backend (Spring Boot) developed concurrently | Strictly sequential handoffs between teams |

---

### Agile Characteristics Observed in This Project

- **Incremental delivery**: Authentication was built first, then event management, then student registration — each as a standalone working increment.
- **Iterative refinement**: Multiple debugging and deployment sessions improved the system without rewriting its core.
- **Parallel development**: The React frontend and Spring Boot backend were developed side-by-side with a clear API contract (REST + JWT) as the integration point.
- **Continuous integration**: Code was pushed to GitHub repeatedly in small, working batches rather than one final release.
- **Adaptive design**: The security layer (Spring Security + JWT filter) was integrated and refined as the need became clearer during implementation, not rigidly defined upfront.
