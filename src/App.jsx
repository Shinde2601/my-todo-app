// src/App.jsx
import "./App.css";
import { useState, useRef, useEffect } from "react";
import Header from "./Header";
import Login from "./Login";
import UserMenu from "./UserMenu";
import { useAuth } from "./AuthProvider";
import {
  subscribeToTodos,
  saveTodoDoc,
  deleteTodoDoc,
} from "./firestoreHelpers";

export default function App() {
  // Auth must be read before any effects that reference `user`
  const { user, initializing } = useAuth();

  // palette for auto-assigning new tag colors
  const COLOR_PALETTE = [
    "bg-blue-100 text-blue-700",
    "bg-indigo-100 text-indigo-700",
    "bg-pink-100 text-pink-700",
    "bg-teal-100 text-teal-700",
    "bg-orange-100 text-orange-700",
    "bg-slate-100 text-slate-700",
  ];

  // app state
  const [todoText, setTodoText] = useState("");
  const [todos, setTodos] = useState(() => {
    try {
      const raw = localStorage.getItem("todos");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [tagOptions, setTagOptions] = useState(() => {
    try {
      const raw = localStorage.getItem("tagOptions");
      return raw ? JSON.parse(raw) : ["Work", "Personal", "Study", "Shopping"];
    } catch {
      return ["Work", "Personal", "Study", "Shopping"];
    }
  });

  const [tagColors, setTagColors] = useState(() => {
    try {
      const raw = localStorage.getItem("tagColors");
      return raw
        ? JSON.parse(raw)
        : {
            Work: "bg-red-100 text-red-700",
            Personal: "bg-purple-100 text-purple-700",
            Study: "bg-green-100 text-green-700",
            Shopping: "bg-yellow-100 text-yellow-700",
          };
    } catch {
      return {
        Work: "bg-red-100 text-red-700",
        Personal: "bg-purple-100 text-purple-700",
        Study: "bg-green-100 text-green-700",
        Shopping: "bg-yellow-100 text-yellow-700",
      };
    }
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const editInputRef = useRef(null);

  const [filter, setFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest | az | za

  // selected tags (for creating a todo)
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState("");

  // toast
  const [toast, setToast] = useState(null);

  // UI: tag panel visibility + anchor
  const [showTagPanel, setShowTagPanel] = useState(false);
  const [tagPanelAnchor, setTagPanelAnchor] = useState("input"); // "input" | "filters"

  const [dueDate, setDueDate] = useState("");

  // stats
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;

  // Persist tagOptions and tagColors always (they're local UI config)
  useEffect(() => {
    try {
      localStorage.setItem("tagOptions", JSON.stringify(tagOptions));
    } catch {
      // ignore
    }
  }, [tagOptions]);

  useEffect(() => {
    try {
      localStorage.setItem("tagColors", JSON.stringify(tagColors));
    } catch {
      // ignore
    }
  }, [tagColors]);

  // Persist todos to localStorage only when NOT logged in (authenticated users use Firestore)
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem("todos", JSON.stringify(todos));
      } catch {
        // ignore
      }
    }
  }, [todos, user]);

  // SINGLE Firestore subscription: subscribe when user exists, unsubscribe on sign-out
  useEffect(() => {
    if (!user) {
      // keep local todos as-is (or you could clear them)
      return;
    }
    const unsubscribe = subscribeToTodos(user.uid, (items = []) => {
      // Expect items array of docs like { id, text, completed, createdAt, ... }
      setTodos(items);
    });
    return () => unsubscribe && unsubscribe();
  }, [user]);

  // autofocus edit input
  useEffect(() => {
    if (editingIndex !== null) {
      editInputRef.current?.focus();
      const len = editInputRef.current?.value?.length ?? 0;
      editInputRef.current?.setSelectionRange(len, len);
    }
  }, [editingIndex]);

  // Toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Tag panel toggle helper (anchor: "input" or "filters")
  const toggleTagPanel = (anchor) => {
    setShowTagPanel((open) => {
      if (open && tagPanelAnchor === anchor) {
        return false; // close if same anchor clicked again
      }
      setTagPanelAnchor(anchor);
      return true;
    });
  };

  // Add todo
  const addTodo = async () => {
    if (todoText.trim() === "") {
      showToast("Please enter a todo", "error");
      return;
    }
    const newTodo = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      text: todoText.trim(),
      completed: false,
      tags: selectedTags.slice(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      createdAt: Date.now(),
    };

    if (user) {
      try {
        await saveTodoDoc(user.uid, newTodo);
        showToast("Todo saved", "success");
        // Firestore subscription updates local todos
      } catch (err) {
        console.error("saveTodoDoc failed:", err);
        showToast("Failed to save todo", "error");
      }
    } else {
      setTodos((prev) => [...prev, newTodo]);
      showToast("Todo added", "success");
    }

    setTodoText("");
    setSelectedTags([]);
    setDueDate("");
    if (tagPanelAnchor === "input") setShowTagPanel(false);
  };

  // toggle complete by id (update locally & on Firestore if logged in)
  const toggleTodo = async (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );

    if (!user) return;

    try {
      const target = todos.find((t) => t.id === id) || { id };
      const updated = {
        ...target,
        completed: !target.completed,
        // eslint-disable-next-line react-hooks/purity
        updatedAt: Date.now(),
      };
      await saveTodoDoc(user.uid, updated);
    } catch (err) {
      console.error("toggleTodo failed:", err);
      showToast("Failed to update todo", "error");
    }
  };

  // delete by id
  const deleteTodo = async (id) => {
    // optimistic local remove
    setTodos((prev) => prev.filter((todo) => todo.id !== id));

    if (user) {
      try {
        await deleteTodoDoc(user.uid, id);
        showToast("Todo deleted", "success");
      } catch (err) {
        console.error("deleteTodo failed:", err);
        showToast("Failed to delete", "error");
      }
    } else {
      showToast("Todo deleted", "success");
    }
  };

  // editing
  const startEdit = (id) => {
    setEditingIndex(id);
    const found = todos.find((t) => t.id === id);
    setEditingText(found ? found.text : "");
  };

  const saveEdit = async (id) => {
    if (editingText.trim() === "") return;

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, text: editingText } : todo
      )
    );
    setEditingIndex(null);
    setEditingText("");

    if (!user) {
      showToast("Edit saved", "success");
      return;
    }

    try {
      const target = todos.find((t) => t.id === id) || { id };
      // eslint-disable-next-line react-hooks/purity
      const updated = { ...target, text: editingText, updatedAt: Date.now() };
      await saveTodoDoc(user.uid, updated);
      showToast("Edit saved", "success");
    } catch (err) {
      console.error("saveEdit failed:", err);
      showToast("Failed to save edit", "error");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  // tag selection while creating
  const toggleSelectedTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // add a tag option (assign a color)
  const addTagOption = (newTag) => {
    const tag = newTag.trim();
    if (!tag) {
      showToast("Tag is empty", "error");
      return;
    }
    if (tagOptions.includes(tag)) {
      showToast("Tag already exists", "error");
      return;
    }

    const randomColor =
      COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    setTagColors((prev) => ({ ...prev, [tag]: randomColor }));

    setTagOptions((prev) => [...prev, tag]);
    showToast("Tag added", "success");
  };

  const removeTagOption = (tagToRemove) => {
    setTagOptions((prev) => prev.filter((t) => t !== tagToRemove));
    setSelectedTags((prev) => prev.filter((t) => t !== tagToRemove));
    setTodos((prev) =>
      prev.map((todo) => ({
        ...todo,
        tags: (todo.tags || []).filter((t) => t !== tagToRemove),
      }))
    );
    setTagColors((prev) => {
      const copy = { ...prev };
      delete copy[tagToRemove];
      return copy;
    });
    showToast("Tag removed", "success");
  };

  // calendar UI state (must be declared before filteredTodos)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() }; // month: 0-11
  });
  const [dateFilter, setDateFilter] = useState(""); // "YYYY-MM-DD" or "" for no date filter

  // helper: format ISO -> YYYY-MM-DD
  const dateKey = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // helper: returns days array for calendar grid
  const getCalendarDays = (year, month) => {
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay(); // 0 Sun .. 6 Sat
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // pad for previous month
    for (let i = 0; i < startWeekday; i++) days.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  // helper: previous / next month
  const prevMonth = () => {
    setCalendarMonth((cur) => {
      const m = cur.month - 1;
      if (m < 0) return { year: cur.year - 1, month: 11 };
      return { year: cur.year, month: m };
    });
  };
  const nextMonth = () => {
    setCalendarMonth((cur) => {
      const m = cur.month + 1;
      if (m > 11) return { year: cur.year + 1, month: 0 };
      return { year: cur.year, month: m };
    });
  };

  // filtering (status + tag)
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active" && todo.completed) return false;
    if (filter === "completed" && !todo.completed) return false;
    if (tagFilter && (!todo.tags || !todo.tags.includes(tagFilter)))
      return false;

    if (dateFilter) {
      const dk = dateKey(todo.dueDate);
      if (dk !== dateFilter) return false;
    }
    return true;
  });

  // map YYYY-MM-DD -> count of todos due that day
  const todosByDate = todos.reduce((acc, t) => {
    const k = dateKey(t.dueDate);
    if (!k) return acc;
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  // sorting derived
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sort === "newest") return (b.createdAt || 0) - (a.createdAt || 0);
    if (sort === "oldest") return (a.createdAt || 0) - (b.createdAt || 0);
    if (sort === "az") return a.text.localeCompare(b.text);
    if (sort === "za") return b.text.localeCompare(a.text);
    return 0;
  });

  const isOverdue = (todo) => {
    if (!todo.dueDate) return false;
    const due = new Date(todo.dueDate);
    const now = new Date();
    return !todo.completed && due < now;
  };

  if (initializing) return null;
  if (!user) return <Login />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-md text-sm ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100">
        <Header />
        <div className="flex justify-end mb-3">
          <UserMenu />
        </div>

        {/* Input group — fixed Add alignment */}
        <div className="mt-4">
          <div className="flex items-start gap-3">
            {/* main pill input */}
            <div className="flex-1 min-w-0 flex items-center gap-3 bg-white border border-gray-200 rounded-full px-3 py-2 shadow-sm">
              <input
                type="text"
                placeholder="What do you want to do?"
                className="flex-1 text-sm placeholder-gray-400 focus:outline-none min-w-0"
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
                aria-label="New todo"
              />

              {/* small inline hint */}
              <div className="hidden sm:block text-xs text-gray-400">
                Press Enter to add
              </div>
            </div>

            {/* Add button fixed */}
            <div className="flex-none">
              <button
                onClick={addTodo}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-blue-600 to-blue-500 text-white rounded-lg shadow-md hover:from-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Add todo"
              >
                Add
              </button>
            </div>
          </div>

          {/* tag panel toggle and sort (row under input) */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleTagPanel("input")}
                className={`px-3 py-1 rounded text-sm ${
                  tagFilter
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Tags
              </button>

              <div className="text-xs text-gray-400 ml-2">
                Select tags for the todo after opening Tags
              </div>
            </div>

            {/* due date input */}
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-sm ml-2 border rounded px-2 py-1"
              aria-label="Due date"
            />

            <div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-gray-200 rounded px-3 py-1 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="az">A - Z</option>
                <option value="za">Z - A</option>
              </select>
            </div>
          </div>

          {/* Tag panel under input (only when anchored to input) */}
          {showTagPanel && tagPanelAnchor === "input" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tagOptions.map((t) => {
                const active = selectedTags.includes(t);
                const classes = tagColors[t] || "bg-gray-200 text-gray-700";
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleSelectedTag(t)}
                    className={`text-sm px-3 py-1 rounded-full flex items-center gap-2 transition ${
                      active ? "ring-2 ring-blue-300" : "opacity-95"
                    } ${classes}`}
                    aria-pressed={active}
                  >
                    {t}
                    {active && <span className="ml-1 text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Filters (All / Active / Completed) + Tag toggle under filters */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1 rounded ${
                filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-1 rounded ${
                filter === "active" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-1 rounded ${
                filter === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Tag filter toggle (anchors panel to filters) */}
          <div>
            <button
              type="button"
              onClick={() => toggleTagPanel("filters")}
              className={`ml-3 px-3 py-1 rounded text-sm ${
                tagFilter ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {tagFilter ? tagFilter : "Tags ▾"}
            </button>
          </div>
        </div>

        {/* Tag panel under filters (only when anchored to filters) */}
        {showTagPanel && tagPanelAnchor === "filters" && (
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {tagOptions.map((t) => {
              const active = tagFilter === t;
              const classes = tagColors[t] || "bg-gray-200 text-gray-700";
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTagFilter((prev) => (prev === t ? "" : t));
                  }}
                  className={`text-sm px-3 py-1 rounded-full transition ${
                    active
                      ? "ring-2 ring-blue-300 bg-blue-600 text-white"
                      : classes
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}

        {/* Tag management (move below filters) */}
        <div className="mt-4">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="New tag name"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              className="border p-2 rounded text-sm flex-1"
            />
            <button
              onClick={() => {
                addTagOption(newTagInput);
                setNewTagInput("");
              }}
              className="px-3 py-2 bg-green-600 text-white rounded text-sm"
            >
              Add Tag
            </button>
          </div>

          <div className="flex gap-2 flex-wrap mt-2">
            {tagOptions.map((t) => {
              const col = tagColors[t] || "bg-gray-100 text-gray-700";
              return (
                <div
                  key={t}
                  className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded"
                >
                  <span
                    className={`text-sm ${
                      col.split(" ")[1] ? col.split(" ")[1] : "text-gray-700"
                    }`}
                  >
                    {t}
                  </span>
                  <button
                    onClick={() => removeTagOption(t)}
                    className="text-xs px-1 py-0.5 bg-red-500 text-white rounded hover:bg-red-600"
                    aria-label={`Remove tag ${t}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex justify-between text-sm text-gray-600 px-1">
          <span>Total: {totalCount}</span>
          <span>Active: {activeCount}</span>
          <span>Completed: {completedCount}</span>
        </div>

        {/* Mini calendar */}
        <div className="mt-4 bg-white border border-gray-100 rounded-md p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">
              {new Date(calendarMonth.year, calendarMonth.month).toLocaleString(
                undefined,
                { month: "long", year: "numeric" }
              )}
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={prevMonth}
                className="px-2 py-1 rounded text-sm bg-gray-100"
              >
                ‹
              </button>
              <button
                onClick={nextMonth}
                className="px-2 py-1 rounded text-sm bg-gray-100"
              >
                ›
              </button>
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="ml-3 px-2 py-1 text-xs bg-gray-200 rounded"
                >
                  Clear date filter
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-500">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1 mt-1">
            {getCalendarDays(calendarMonth.year, calendarMonth.month).map(
              (d, idx) => {
                if (!d) return <div key={idx} className="h-10" />; // empty cell
                const k = `${d.getFullYear()}-${String(
                  d.getMonth() + 1
                ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                const count = todosByDate[k] || 0;
                const isToday = dateKey(new Date().toISOString()) === k;
                const isSelected = dateFilter === k;
                return (
                  <button
                    key={k}
                    onClick={() => setDateFilter(isSelected ? "" : k)}
                    className={`h-10 flex flex-col items-center justify-center text-xs rounded transition ${
                      isSelected ? "bg-blue-600 text-white" : "bg-white"
                    } ${
                      isToday && !isSelected ? "ring-1 ring-blue-200" : ""
                    } border border-transparent hover:border-gray-200`}
                  >
                    <div className="text-sm">{d.getDate()}</div>
                    {count > 0 && (
                      <div
                        className={`mt-1 text-[10px] px-1 rounded-full ${
                          isSelected
                            ? "bg-white text-blue-600"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {count}
                      </div>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Todo list */}
        <ul className="mt-5 divide-y divide-gray-100">
          {filteredTodos.length === 0 && (
            <li className="text-center text-sm text-gray-400 py-8">
              <svg
                className="mx-auto mb-3 w-16 h-16 text-gray-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7h18M5 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7"
                />
                <path
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 7v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                />
              </svg>
              <div className="font-medium">No todos here</div>
              <div className="text-xs mt-1">
                Add your first task — it only takes a second ✨
              </div>
            </li>
          )}

          {sortedTodos.map((todo) => (
            <li
              key={todo.id}
              className={`flex items-center justify-between gap-3 py-3 px-3 rounded-md transition-shadow hover:shadow-sm hover:translate-y-0.5 ${
                isOverdue(todo) ? "bg-red-50 border border-red-200" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="w-5 h-5 rounded-sm accent-blue-600 flex-shrink-0"
                  aria-label={`Mark ${todo.text} completed`}
                />

                <div className="min-w-0">
                  {editingIndex === todo.id ? (
                    <input
                      ref={editInputRef}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(todo.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="w-full border p-1 rounded text-sm"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          todo.completed
                            ? "line-through text-gray-400"
                            : "text-gray-800"
                        } truncate`}
                      >
                        {todo.text}
                      </span>

                      {/* Due date display */}
                      {todo.dueDate && (
                        <span className="text-xs text-gray-500 ml-2">
                          • Due: {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      )}

                      {todo.tags && todo.tags.length > 0 && (
                        <div className="ml-2 flex gap-2 items-center flex-wrap">
                          {todo.tags.map((tg) => {
                            const classes =
                              tagColors[tg] || "bg-gray-100 text-gray-700";
                            const bgClass =
                              classes.split(" ")[0] || "bg-gray-100";
                            return (
                              <div key={tg} className="flex items-center gap-2">
                                <span
                                  className={`${bgClass} inline-block w-2 h-2 rounded-full`}
                                  aria-hidden="true"
                                />
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${classes}`}
                                  title={tg}
                                  aria-label={`Tag ${tg}`}
                                >
                                  {tg}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editingIndex === todo.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(todo.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-md text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-100 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(todo.id)}
                      className="px-3 py-1 bg-yellow-400 text-white rounded-md text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
