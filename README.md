# Library Management System - V2

This project is a web-based Library Management System designed to handle e-books across various sections, functioning like an online library. It supports multi-user roles including a librarian for managing the library and general users for accessing e-books. The application is built using Flask for the backend, Vue.js for the frontend, and SQLite for data storage, among other technologies.

## Features

### Core Functionalities

1. **Admin Login and User Login (RBAC)**:
    - Role-based access control with same login forms for librarians and users.
    - The librarian role is uniquely identified and assigned automatically upon database creation.
    - Supports Flask Security for managing sessions.

2. **Librarian Dashboard**:
    - Displays statistics such as active users, grant requests, e-books issued, and more.
    - Designed for the librarian to manage and monitor the system efficiently.

3. **Section Management**:
    - Create, update, and delete sections for organizing e-books.
    - Manage section details such as ID, name, creation date, and description.

4. **e-Book Management**:
    - Allows the librarian to create, edit, and delete e-books within sections.
    - Manage e-book details like ID, name, content, author(s), issue date, and return date.

5. **Search Functionality**:
    - Users can search for e-books based on section, author, title, etc.
    - Search sections for relevant e-books.

6. **General User Functionalities**:
    - Request or return e-books, with a limit of 5 e-books at a time.
    - E-books are accessible for a specific period, after which access is revoked.
    - Users can provide feedback and rate e-books.

7. **Librarian Functionalities**:
    - Manage e-book issue/return requests from users.
    - Grant or revoke access to e-books for users.
    - Monitor user activity and e-book status.

8. **Backend Jobs**:
    - **Scheduled Job - Daily Reminders**: Sends daily reminders to users via Google Chat, SMS, or email (used Mail-Hog).
    - **Scheduled Job - Monthly Activity Report**: Generates a report of library activities, sent via email on the first day of every month.
    - **User Triggered Async Job - Export as CSV**: Allows the librarian to export details of e-book as a CSV file.

9. **Performance and Caching**:
    - Implements caching to enhance performance with cache expiry strategies.
    - Optimizes API performance.

### Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: Vue.js, Bootstrap for styling
- **Database**: SQLite
- **Caching**: Redis
- **Task Management**: Redis and Celery

### Installation

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/jt232003/BookLuv-2.0.git
    ```

2. **Navigate to the Project Directory**:
    ```bash
    cd BookLuv-2.0
    ```

3. **Create a Virtual Environment**:
    ```bash
    python -m venv venv
    ```

4. **Activate the Virtual Environment**:
    - On Windows:
      ```bash
      venv\Scripts\activate
      ```
    - On macOS/Linux:
      ```bash
      source venv/bin/activate
      ```

5. **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

6. **Setup Redis and Celery**:
    - Install and configure Redis.
    - Configure Celery for task management.

7. **Run the Application**:
    ```bash
    flask run
    ```

8. **Access the Application**:
    - Open your web browser and navigate to `http://127.0.0.1:5000`.


### Presentation Video

For a detailed walkthrough of the project, watch the presentation video [here](https://drive.google.com/file/d/19RBBK73sCf41mx9tcZOW77eKZyWcPNm4/view?usp=sharing).

If you have any questions or suggestions, feel free to reach out:

- **LinkedIn**: [Jalaj Trivedi](https://www.linkedin.com/in/jalaj-trivedi-961b62221)


