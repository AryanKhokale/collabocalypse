# Collabocalypse

**Collabocalypse** is a collaborative real-time document editing platform that enables multiple users to work on shared documents simultaneously. It combines a robust FastAPI backend with a modern React frontend, featuring real-time synchronization via WebSockets and Message Broker, user authentication through Keycloak, and persistent storage with PostgreSQL and Redis caching.

## Features
- **Real-time Collaborative Editing** - Multiple users can edit documents simultaneously with live updates
- **WebSocket-powered Synchronization** - Instant synchronization across distributed backend instances via Redis Pub/Sub
- **Horizontal Scalability** - Stateless architecture with load balancing supporting unlimited concurrent users
- **Rich Text Editor** - Integrated with React Quill for advanced document editing capabilities
- **High Performance** - Redis in-memory caching and deferred database writes for optimal throughput

## Technology Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL (persistent storage)
- **Cache**: Redis (buffer and performance optimization)
- **Authentication**: Keycloak
- **Protocol**: WebSockets for real-time communication
- **Architecture**: Async/await with SQLAlchemy+asyncpg ORM

### Frontend
- **Framework**: React 18.3+
- **Build Tool**: Vite 7.2+
- **Text Editor**: React Quill 2.0
- **Routing**: React Router DOM 7.12+
- **Authentication**: Keycloak integration

## System Architecture

Collabocalypse is designed as a distributed, real-time collaborative document editing system. The architecture separates concerns across client, routing, stateless backend services, in-memory synchronization, and persistent storage to ensure low latency, scalability, and consistency across multiple users.

### High-Level Overview

The system follows this flow:

<img width="1112" height="603" alt="image" src="https://github.com/user-attachments/assets/c61f979f-d329-4906-b6b9-53d10cc224d8" />

### Architecture Components

#### 1. Frontend (Client)

The frontend is a browser-based document editor responsible for:

- Capturing user input (text edits, cursor movement)
- Sending real-time updates via WebSockets
- Rendering updates received from other collaborators
- Triggering save operations via HTTP requests

#### 2. NGINX (Reverse Proxy and Load Balancer)

NGINX acts as the entry point for all client requests.

**Responsibilities:**
- Routes incoming HTTP and WebSocket traffic to backend instances
- Performs load balancing using the Least Connections algorithm
- Ensures efficient distribution of long-lived WebSocket connections
- Acts as a GATEWAY for backend API
- Enhances security by preventing direct exposure of server ports to clients and eliminating direct client-side access to server interfaces

The Least Connections strategy is used because real-time collaboration relies on persistent connections, and this approach distributes load based on active connections rather than request count.

#### 3. Backend Instances (Stateless Services)

Multiple backend instances run in parallel to handle concurrent users.

**Responsibilities:**
- Each instance maintains a WebSocket connections with clients
- Process incoming document updates
- Synchronize document state through Redis
- Broadcast updates to connected clients

These services are stateless, allowing horizontal scaling by adding more instances without affecting system behavior.

#### 4. Redis (In-Memory Data Layer)

Redis serves two critical roles:

**a) Cache Layer**
- Stores the latest state of documents in memory
- Enables low-latency read and write operations
- Acts as the source of truth during active editing sessions

**b) Pub/Sub Mechanism**
- Enables communication between backend instances
- Acts as a message broker for real-time synchronization
- Ensures consistency across distributed servers

When a backend instance receives an update, it publishes the change to a Redis channel. Other backend instances subscribed to that channel receive the update and propagate it to their connected clients.

#### 5. PostgreSQL (Persistent Storage)

PostgreSQL is used for long-term storage of documents.

**Responsibilities:**
- Stores finalized document state when explicitly saved
- Ensures durability and consistency of data
- Supports retrieval of documents for future sessions

Real-time edits are not written directly to the database. Instead, writes occur only when a user triggers a save action, reducing database load and improving performance.

### Data Flow

#### Real-Time Editing Flow

1. User input is captured in the frontend editor
2. Changes are sent to the backend via WebSocket
3. Backend updates the document state in Redis
4. Backend publishes the update to Redis Pub/Sub
5. Other backend instances receive the update
6. Updates are pushed to all connected clients in real time via WebSockets

#### Manual Save Flow

1. User triggers a save action
2. Request is routed through NGINX to a backend instance
3. Backend retrieves the latest document state from Redis
4. Data is written to PostgreSQL
5. Success response is returned to the client

### Load Balancing Strategy

The system uses the **Least Connections** algorithm for load balancing:

- Distributes traffic based on the number of active connections per backend
- Particularly effective for WebSocket-based systems with long-lived sessions
- Prevents uneven load distribution across instances

### Key Design Decisions

- Stateless backend services enable horizontal scalability
- Redis is used as the primary synchronization and cache layer for real-time updates
- Pub/Sub ensures consistency across distributed backend instances
- Database writes are deferred until explicit save actions to reduce load
- NGINX efficiently manages incoming traffic and connection distribution

### Scalability

The architecture supports horizontal scaling by:

- Adding more backend instances
- Leveraging Redis for shared state and synchronization
- Using NGINX to distribute load effectively

## Prerequisites

- **Docker** 20.10+
- **Docker Compose** 1.29+ (optional, for managing multiple containers)

## Installation & Setup Using Docker

The application is fully containerized and can be deployed using Docker. Follow the steps below to run all services.

### Quick Start

Start all containers in the following order:

#### 1. Start Redis Cache
```bash
docker run --name redis -p 6379:6379 -d redis
```

If the above command fails, use the Alpine version:
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

#### 2. Start Keycloak Authentication Service
```bash
docker run -d --name collabocalypse-auth -p 9000:8080 aryankhokale/collabocalypse-auth:v2
```

**Access Keycloak Admin Console:** `http://localhost:9000`

#### 3. Start PostgreSQL Database
```bash
docker run --name collabocalypse-db -p 5433:5432 -d aryankhokale/collabocalypse-db:v2
```

#### 4. Start NGINX Reverse Proxy and Load Balancer
```bash
docker run -d -p 8000:80 --name collabocalypse-nginx aryankhokale/collabocalypse-nginx:v1
```

#### 5. Start Backend Services

**Mandatory - Backend Instance 1:**
```bash
docker run -d -p 1000:8000 --name collabocalypse-backend1 aryankhokale/collabocalypse-backend:v7
```

**Optional - Additional Backend Instances (for scaling):**
```bash
# Backend Instance 2
docker run -d -p 2000:8000 --name collabocalypse-backend2 aryankhokale/collabocalypse-backend:v7

# Backend Instance 3
docker run -d -p 3000:8000 --name collabocalypse-backend3 aryankhokale/collabocalypse-backend:v7

# Backend Instance 4
docker run -d -p 4000:8000 --name collabocalypse-backend4 aryankhokale/collabocalypse-backend:v7

# Backend Instance 5
docker run -d -p 5000:8000 --name collabocalypse-backend5 aryankhokale/collabocalypse-backend:v7

# Backend Instance 6
docker run -d -p 6000:8000 --name collabocalypse-backend6 aryankhokale/collabocalypse-backend:v7

# Backend Instance 7
docker run -d -p 7000:8000 --name collabocalypse-backend7 aryankhokale/collabocalypse-backend:v7
```

#### 6. Start Frontend Application
```bash
docker run --name collabocalypse-frontend -d -p 5173:5173 aryankhokale/collabocalypse-frontend:v2
```

### Access the Application

Once all containers are running:

- **Frontend Application:** `http://localhost:5173`
- **NGINX Load Balancer:** `http://localhost:8000`
- **Backend API (Direct):** `http://localhost:1000`
- **Keycloak Admin:** `http://localhost:9000`
- **API Documentation:** `http://localhost:8000/docs` (Swagger UI)

### Container Management

#### View Running Containers
```bash
docker ps
```

#### Stop All Containers
```bash
docker stop redis collabocalypse-auth collabocalypse-db collabocalypse-nginx collabocalypse-backend1 collabocalypse-backend2 collabocalypse-backend3 collabocalypse-backend4 collabocalypse-backend5 collabocalypse-backend6 collabocalypse-backend7 collabocalypse-frontend
```

#### Remove Containers
```bash
docker rm redis collabocalypse-auth collabocalypse-db collabocalypse-nginx collabocalypse-backend1 collabocalypse-backend2 collabocalypse-backend3 collabocalypse-backend4 collabocalypse-backend5 collabocalypse-backend6 collabocalypse-backend7 collabocalypse-frontend
```

#### View Container Logs
```bash
docker logs <container_name>
```

#### Example: View Backend Instance 1 Logs
```bash
docker logs collabocalypse-backend1
```

## Authentication

The application uses **Keycloak** for authentication:

1. Users log in through the Keycloak login page
2. JWT tokens are issued upon successful authentication
3. Tokens are used for API requests and WebSocket connections
4. Token refresh is handled automatically

## Database Schema

### Key Tables
- **Users**: User account and profile information
- **Documents**: Document metadata and ownership
- **DocumentPermissions**: User access control for documents
- **Templates**: Document templates for quick creation
- **Sessions**: Active user sessions and connections

## Deployment

The application is production-ready with Docker containers. All components are containerized and can be deployed to any Docker-compatible platform (Docker Swarm, Kubernetes, cloud providers, etc.).

### Production Considerations

- Use docker-compose for orchestration in production
- Implement container health checks
- Set resource limits for each container
- Use environment-specific configuration
- Enable logging aggregation
- Set up monitoring and alerting

## Development Workflow

### Container Inspection

View logs from any running container:
```bash
docker logs -f <container_name>
```

### Scaling Backend Services

To scale the application for higher load, start additional backend instances:

```bash
# Start a new backend instance on a different port
docker run -d -p <new_port>:8000 --name collabocalypse-backend<N> aryankhokale/collabocalypse-backend:v5
```

The NGINX load balancer automatically distributes traffic across all running backend instances using the Least Connections algorithm.

### Health Checks

Verify all services are running:

```bash
# Check Redis
docker exec redis redis-cli ping

# Check Backend (if accessible)
curl http://localhost:8000/health

# View all running containers
docker ps
```

## Troubleshooting

### WebSocket Connection Issues
- Ensure the backend server is running
- Check CORS configuration in `API/Middlewares/CORS.py`
- Verify network connectivity to the WebSocket endpoint

### Database Connection Errors
- Verify PostgreSQL is running and accessible
- Check DATABASE_URL configuration
- Ensure database credentials are correct

### Real-time Sync Not Working
- Check Redis connection is active
- Verify WebSocket ConnectionManager is properly initialized
- Review ConnectionManager logs for connection issues

## Contributing
1. Create a feature branch (`git checkout -b feature/your-feature`)
2. Make your changes
3. Run linting and tests
4. Commit your changes (`git commit -m 'Add your feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request

## License
[Specify your license here - MIT, Apache 2.0, GPL, etc.]

## Support
For issues, questions, or contributions, please open an issue or contact the development team.

---

**Last Updated**: April 2026

---

## 🚀 Guide

### 🟢 Get Started
<img width="1918" height="906" alt="c-landingpage" src="https://github.com/user-attachments/assets/64b687a9-b2bf-46fb-8534-2345d6de3221" />

- **Features** – Shows the features of Collabocalypse along with a demo  
- **GitHub** – Links to the official GitHub repository  
- **Get Started** – Entry point to begin using the app  
- Redirects the user to the **Sign-In page**

---

### 🔐 Sign in with Google
<img width="1918" height="902" alt="c-signin" src="https://github.com/user-attachments/assets/91339c24-9a35-4750-9c4f-36a1e465cd6a" />

- Sign in using Google for an easy authentication process  
- Redirects the user to the **Home page**

---

### 🏠 Home
<img width="1918" height="900" alt="c-createdoc" src="https://github.com/user-attachments/assets/b9b6bf29-90a9-4ec8-b779-093d89e82a22" />

- User can now interact with Collabocalypse features  
- Create a new blank document  
- Enter a **unique document name** (no duplicates allowed)  
- Choose a folder:
  - Default: **Workspace**
  - Custom folder names allowed  
- If the folder does not exist, it will be created automatically  
- User can also select from available folders  
- The creator becomes the **ADMIN**:
  - Only one ADMIN per document  
  - ADMIN cannot be changed  
- Redirects the user to the **Editor**

---


## ✏️ Editor

<img width="1915" height="907" alt="editor-preview" src="https://github.com/user-attachments/assets/d354a0ae-6b5f-418b-935e-b5a2ad67bd41" />

The **Editor** is the core workspace designed for seamless real-time collaboration.

---

### 🤝 Collaboration

* Multiple users can **edit the document simultaneously**.
* All changes are **synchronized in real time** across connected users.
* Updates made by any user are **instantly broadcasted** to others with minimal latency.

---

### ⚡ Real-Time Experience

* Provides a **collaborative and responsive editing environment**.
* Ensures all users are always viewing the **latest state of the document**.

---

## 🧰 Toolbar

* A dedicated **toolbar** is available for document customization and formatting.
* Includes all essential tools required for **editing and styling content**.
* Designed to be **intuitive and user-friendly** for a smooth experience.



---



 ## 🚦 Status

### 🟢 Connected

When the status shows **Connected**, the system is fully operational and the user can continue working seamlessly.

---

### 🔴 Disconnected
<img width="1916" height="896" alt="image" src="https://github.com/user-attachments/assets/5da407a4-fd88-4c53-9aa5-7e86b89783eb" />

If the status shows **Disconnected**, it may be due to one of the following reasons:

*  **Server Unavailable**
  The server may be down or temporarily under maintenance.

*  **Document Removed**
  The document might have been deleted by the ADMIN.

* 🔒 **Access Restricted**
  The user may not have the necessary permissions to access the document.

---

> 💡 **Tip:** If the issue persists, try refreshing the page or contacting the ADMIN of the document.


---

### 👥 Share with Users
<img width="1918" height="900" alt="c-editorshare" src="https://github.com/user-attachments/assets/44b7b44d-f3f7-443e-aad0-598047b091e3" />

- **Only the ADMIN can add users**
   - Non ADMIN does not have the priviledge to add a user
  <img width="1917" height="902" alt="image" src="https://github.com/user-attachments/assets/371d0522-4bdf-4e3e-b279-f809c18f052d" />
  
- Users are added via **email (user ID)**  
- Multiple users can be added at once:
  - Example: `abc@gmail.com, xyz@gmail.com`  
- Only authorized users can access the document
- **Invitation mail is sent to the respective users**
<img width="1918" height="907" alt="image" src="https://github.com/user-attachments/assets/8ec72fcf-c9bf-4594-9a8e-f35ada0e35cb" />

### ✉️ Invitation Template

* The invitation email body follows the standardized format below:

  * **Message Format:**
    *You’ve been invited to collaborate on* **{document_id}**: **{document_link}**

* Replace the placeholders dynamically:

  * `{document_id}` → Unique identifier of the document
  * `{document_link}` → Direct access link to the document

---

## 💾 Save Version

<img width="1919" height="899" alt="version-preview" src="https://github.com/user-attachments/assets/9db4abcc-0539-45d2-aeda-6eaf903e4a59" />

### 🔢 Versioning System

* Every document is initially created with **Version: 0**.
* Each time the user performs a manual **Save**, the version number increments by **+1**.
* The version number represents:

  * The total number of successful saves.
  * Whether the user is working on the **latest version** of the document.

---

### 📸 Snapshot Mechanism

* On clicking **Save**, the system:

  * Captures a snapshot of the current editor state.
  * Stores it as the next version (**current version + 1**).
---

> ⏳ **CACHE NOTE:** If a user forgets to save, the **unsaved content is temporarily stored in cache for up to 1 hour**. During this period:
>
> * Other users opening the document may see this unsaved content.
> * The content can still be saved within this time window.
>
> After **1 hour**, if the content has not been saved, it will be **permanently discarded**.

---

## ⚠️ Version Conflict

<img width="1918" height="907" alt="version-conflict" src="https://github.com/user-attachments/assets/0186d712-4a4a-4185-bc26-483eb95e0092" />

### 🚫 When Does Conflict Occur?

* Save operation is allowed **only if the user is on the latest version**.
* If a user attempts to save an **outdated version**, a **version conflict** will occur.

---

### 🛠️ How to Resolve

Follow these steps to resolve the conflict:

1. 🔄 **Refresh the document**
   Sync your editor with the latest version.

2. 💾 **Save again**
   Once updated, retry saving your changes.

---

> 📝 **NOTE :** There will be **no inconsistency, data loss, or overwriting** even if your version is not the latest. The version number is used **only to control save conditions**. Regardless of the version, the editor always displays the **latest real-time content and updates**. Being on an older version does **not** mean you are viewing outdated data.

---

>  ⏳ **CACHE NOTE:** If a user forgets to save, the **unsaved content is temporarily stored in cache for up to 1 hour**. During this period:
>
> * Other users opening the document may see this unsaved content.
> * The content can still be saved within this time window.
>
> After **1 hour**, if the content has not been saved, it will be **permanently discarded**.

---
## 🗑️ Delete


### 🔐 Admin Privileges Only

* Only users with **ADMIN** rights are authorized to delete a document.
* Non-admin users **do not** have permission to perform this action.
  <img width="1919" height="899" alt="image" src="https://github.com/user-attachments/assets/071bb76a-4259-4bce-be09-c770caccb7d6" />

---

### ⚠️ Permanent Action

* Once a document is deleted, the action is **irreversible**.
* The document **cannot be recovered** in the future.

---

> 💡 **Warning:** Please ensure you really intend to delete the document before proceeding, as this action cannot be undone.



---

### 📄 Create Documents with Prebuilt Templates
<img width="1918" height="912" alt="c-createwithtempl" src="https://github.com/user-attachments/assets/e90a8a23-eb7a-44df-9adf-bea23a067208" />

- Collabocalypse provides prebuilt document templates  
- User can select a template based on their needs  
- Each template includes a predefined structure  
- Currently available templates:

1. Letter  
2. Informal Letter  
3. Project Proposal  
4. Meeting Notes  
5. Resume  
6. Business Letter  

---

### 📝 Example: Informal Letter Template
<img width="1915" height="905" alt="c-createwithtempeg" src="https://github.com/user-attachments/assets/48cfd79f-d3f1-46fa-a627-63d9952173e6" />

- Example of a document created using the **Informal Letter** template  

---

### 🔎 Open Document by Doc ID
<img width="1917" height="908" alt="c-opendocs" src="https://github.com/user-attachments/assets/2fb86b42-edae-451c-acfd-9da3ae2f4d81" />

- Open a document using its **doc ID**  
- Enter the document ID to access it  
- Access rules:
  - If the user is authorized → Access granted  
  - Otherwise → Access denied

## 🚫 Access Denied

<img width="1919" height="964" alt="access-denied-preview" src="https://github.com/user-attachments/assets/61244e19-42b7-4cfd-a49b-8f282100ab15" />

If access to a document is denied, it may be due to one of the following reasons:

* 🔒 **Unauthorized Access**
  The user has not been granted access by the **ADMIN** of the document.

* 🗑️ **Document Deleted**
  The document may have been removed by the **ADMIN**.

* ⚙️ **Server Unavailable**
  The server may be down or temporarily under maintenance.

---


<img width="1919" height="964" alt="image" src="https://github.com/user-attachments/assets/61244e19-42b7-4cfd-a49b-8f282100ab15" />

---

### 📁 My Docs

<img width="1917" height="905" alt="mydocs-preview" src="https://github.com/user-attachments/assets/bb95174d-934c-4cac-ab90-c81c754448f2" />

The **My Docs** section provides a centralized view of all user-specific documents and activities.

---

### 📌 Overview

* Displays all **personal documents** associated with the user.
* Shows a summary of **recent activities** for quick access.
* Enables users to **browse and manage** their documents efficiently.
* Offers an **abstract view** of all documents with key metadata.

---

### 🔍 Sorting Options

Users can organize documents using the following views:

1. **Recent**

   * Displays up to **5 most recently accessed documents**.

2. **A–Z**

   * Displays all documents in **alphabetical order**.

---

### 📄 Document Insights

Each document preview includes:

* 🕒 **Last opened date and time**

* 👥 **Number of collaborators**

* Users can view collaborator IDs by **hovering over the collaborator indicator**:

<img width="1918" height="905" alt="collaborators-preview" src="https://github.com/user-attachments/assets/f09d345b-8178-4ebf-894b-89277bab72a3" />

---

### ⭐ Key Features

* 📌 **Pin Documents**
  Mark important documents for quick access.

* 🔎 **Search Documents**
  Locate documents by entering the **Document ID** in the search bar.

---

### 🗂️ Workspace Management

* Users have a **personalized workspace** to organize documents.
* Create folders for different purposes and **move documents accordingly**.
* Folders can be **deleted at any time**:

  * Upon deletion, all contained documents are moved to the default **Workspace** folder.

---

### ✏️ Additional Actions

* 📝 **Rename Documents**
  Update document names as needed.

* 🔗 **Share Documents**
  Clicking **Share** copies the document link directly to the clipboard.

---

> 💡 **Tip:** Use folders and pinning together to keep your most important documents easily accessible.

---

## 🗒️ Notes

<img width="1916" height="903" alt="notes-preview" src="https://github.com/user-attachments/assets/7cc060df-f428-448a-ac57-d4e3c3ca2eed" />

The **Notes** section provides a dedicated space for users to manage personal tasks and reminders.

---

### ✍️ Features

* 📝 **Personal Notes**
  Maintain a personalized list of daily tasks or important reminders.

* 🔄 **Edit & Update**
  Easily modify existing notes based on changing requirements.

* ❌ **Delete Tasks**
  Remove completed or unnecessary tasks at any time.

---

## 🚪 Logout

* Users can **log out at any time** from their current session.
* Logging out allows users to **switch accounts** or securely end their session.

---

> 💡 **Tip:** Regularly updating your notes can help you stay organized and improve productivity.

---

## 🙌 Thank You

Thank you for using the platform! We hope you have a seamless and productive collaboration experience.


