# 📝 My Todo App — React + Tailwind + Calendar + Tags

A fully polished, advanced Todo App built using **React**, **Vite**, and **Tailwind CSS**.
This application supports **multi-tagging**, **custom tags**, **colored labels**, **due dates**, **calendar-based filtering**, **sorting**, **editing**, **deleting**, **toasts**, and **localStorage data persistence**.

This project goes far beyond a basic todo list — it's designed with real-world usability and clean UI in mind.

---

## 📸 Screenshots

### ⭐ Real App Screenshot

![App Screenshot](/mnt/data/Screenshot 2025-11-22 132259.png)

---

### ⭐ Demo Interface Preview (Placeholder)

![Demo UI](https://via.placeholder.com/800x430.png?text=Todo+App+Demo+Screenshot)

---

## 🚀 Features

### 🧩 Core Features

- ➕ Add todos
- ✔ Mark complete / uncomplete
- ✏ Edit todos
- 🗑 Delete todos

### 🏷 Tag System

- Multi-tag selection
- Add new tags
- Remove tags
- Auto-assign colors to custom tags
- Filter todos by tag
- Tag selector panel (clean UI toggle)

### 📅 Due Dates + Calendar

- Pick due dates when creating todos
- Overdue todos automatically highlighted
- Mini calendar view:
  - Shows number of todos due each day
  - Click a date to filter todos
  - Today is outlined
  - Click again to clear filter

### 🔍 Filtering & Sorting

- Status filters: **All**, **Active**, **Completed**
- Tag filter
- Date filter
- Sort by:
  - Newest
  - Oldest
  - A–Z
  - Z–A

### 🎨 UI / UX Enhancements

- Toast messages
- Smooth transitions
- Hover shadows
- Beautiful color-coded tag badges
- Minimal modern layout

### 💾 Persistence

- Everything (todos, tags, tag colors) stored in `localStorage`
- Data survives page reloads

---

## 🛠 Tech Stack

| Tech                    | Purpose             |
| ----------------------- | ------------------- |
| **React**               | UI & Components     |
| **Vite**                | Fast dev/build tool |
| **Tailwind CSS**        | Styling             |
| **localStorage**        | Data persistence    |
| **JavaScript (ES2023)** | App logic           |
| **CSS Grid**            | Calendar layout     |

---

## 📁 Project Structure

```
my-todo/
├── public/
├── src/
│   ├── App.jsx        # Main application logic
│   ├── Header.jsx     # App Header UI
│   ├── index.css      # Tailwind & global styles
│   ├── main.jsx       # React entry point
│   ├── assets/        # (optional) images/icons
│   └── components/    # future extracted components
├── .gitignore
├── index.html
├── package.json
├── postcss.config.cjs
├── tailwind.config.cjs
└── README.md
```

---

## 💾 Data Storage (localStorage schema)

### Todos

Stored under `todos`:

```json
[
  {
    "id": "unique-string",
    "text": "Todo text",
    "completed": false,
    "tags": ["Work", "Personal"],
    "dueDate": "2025-11-25T00:00:00.000Z"
  }
]
```

### Tags

Stored under `tagOptions`:

```json
["Work", "Personal", "Study", "Shopping", "CustomTag"]
```

### Tag Colors

Stored under `tagColors`:

```json
{
  "Work": "bg-red-100 text-red-700",
  "Personal": "bg-purple-100 text-purple-700",
  "Study": "bg-green-100 text-green-700",
  "Shopping": "bg-yellow-100 text-yellow-700",
  "CustomTag": "bg-blue-100 text-blue-700"
}
```

---

## 🛠 Installation & Setup

```bash
git clone <repo-url>
cd my-todo
npm install
npm run dev
```

Open in browser:  
👉 http://localhost:5173/

---

## 🧪 Development Commands

Start dev server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview production:

```bash
npm run preview
```

---

## 🌍 Deployment (Vercel / Netlify)

Build command:

```
npm run build
```

Publish directory:

```
dist
```

Both platforms automatically detect Vite projects.

---

## 🔥 Firebase Setup

1. Create Firebase project
2. Add Web App → copy SDK config to `firebase.js`
3. Enable Auth (Email/Password + Google)
4. Create Firestore DB
5. Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/todos/{todoId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🤝 Contributing

Contributions are welcome!  
Feel free to:

- Open an issue
- Submit a PR
- Suggest ideas

---

## 📜 License

MIT — free for personal & commercial use.

---

## ⭐ If you like this project, consider giving it a star on GitHub!

It helps others find it and motivates future updates.

## Default Login

ID - demo@gmail.com
Pass - admin@123

---
