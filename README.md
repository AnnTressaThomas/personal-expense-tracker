# Personal Expense Tracker (MERN Stack)

A complete, beginner-friendly **Personal Expense Tracker** web application developed with the **MERN Stack** (MongoDB, Express.js, React with Vite, Node.js) for practical exams, academic evaluations, and everyday personal finance tracking.

---

## 📋 Features

- **Add Expense**: Record new expenses with Title, Amount, Category (Food, Travel, Bills, Shopping, Other), and Date.
- **Display Expenses**: View all saved expenses fetched directly from MongoDB Atlas in a clean, responsive table.
- **Edit Expense**: In-place edit functionality that prefills form values and updates the database via a `PUT` API.
- **Delete Expense**: Delete records with confirmation prompt dialogs via a `DELETE` API.
- **Dynamic Total Calculation**: Live calculation of total expenditure and transaction count across all records.
- **Input Validation**: Robust validation on both client and server (disallowing blank titles, non-numeric or $\le 0$ amounts, invalid categories or dates).
- **Graceful Error & Status Handling**: User-friendly alerts for network errors, database disconnection states, and operation confirmations.
- **Responsive & Modern UI**: Built with pure CSS, clean card containers, badges, and responsive tables for desktop, tablet, and mobile viewing.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite template), Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **API Client**: REST API using browser native `fetch`
- **Utilities**: CORS, Dotenv

---

## 📁 Project Structure

```text
Personal expense tracker/
├── backend/
│   ├── Expense.js          # Mongoose Expense model & schema validation
│   ├── server.js           # Express app, REST API routes & DB connection
│   ├── package.json        # Backend dependencies & scripts
│   ├── .env                # Private environment variables (MONGO_URI, PORT)
│   └── .env.example        # Example environment template
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component (Form, Table, Stats, CRUD state)
│   │   ├── App.css         # Modern, responsive styling
│   │   └── main.jsx        # React root render
│   ├── index.html          # HTML entry point
│   ├── vite.config.js      # Vite configuration
│   └── package.json        # Frontend dependencies & scripts
├── .gitignore              # Ignores node_modules, .env, dist
└── README.md               # Complete project documentation
```

---

## ⚙️ Configuration: MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free cluster (e.g. M0 tier).
3. Under **Security > Database Access**, create a database user with username and password.
4. Under **Security > Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere (`0.0.0.0/0`)** for testing/practical exam demonstrations.
5. In your Cluster dashboard, click **Connect > Drivers (Node.js)** and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/expense_tracker?retryWrites=true&w=majority
   ```
6. Open `backend/.env` in your editor and replace `YOUR_MONGODB_ATLAS_CONNECTION_STRING` with your copied string (make sure to substitute `<username>` and `<password>` with your real credentials):
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://admin:mySecretPassword123@cluster0.xxxx.mongodb.net/expense_tracker?retryWrites=true&w=majority
   ```

> ⚠️ **Important**: Never commit your real database credentials to GitHub. The `.gitignore` is already set up to ignore `backend/.env`.

---

## 🚀 Running the Application

Open **two separate terminal windows** (one for backend, one for frontend).

### Terminal 1: Backend Server

```bash
cd backend
npm run dev
# or: npm start
```
The backend server will start on: **`http://localhost:5000`**

### Terminal 2: Frontend Client

```bash
cd frontend
npm run dev
```
The frontend Vite server will start on: **`http://localhost:5173`** (open this in your web browser).

---

## 📡 REST API Reference

| Method | Endpoint | Description | Sample Request Body / Param |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Check API & database health | *None* |
| **GET** | `/api/expenses` | Retrieve all expenses from DB | *None* |
| **POST** | `/api/expenses` | Add a new expense | `{"title":"Lunch","amount":150,"category":"Food","date":"2026-10-27"}` |
| **PUT** | `/api/expenses/:id` | Update an existing expense | `{"title":"Dinner","amount":250,"category":"Food","date":"2026-10-27"}` |
| **DELETE** | `/api/expenses/:id` | Remove an expense by ID | *URL parameter `id`* |

---

## 📤 Pushing to GitHub

To push this project to your GitHub account:

1. Initialize git and stage all files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Personal Expense Tracker MERN App"
   ```
2. Create a new repository on [GitHub](https://github.com/new) (e.g. named `personal-expense-tracker`).
3. Link your remote repository and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/personal-expense-tracker.git
   git push -u origin main
   ```
