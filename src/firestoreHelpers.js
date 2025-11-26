import { db } from "./firebase";
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
} from "firebase/firestore";

export const todosCollection = (uid) => collection(db, "users", uid, "todos");

export function subscribeToTodos(uid, onChange) {
    const q = query(todosCollection(uid), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        const items = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        onChange(items);
    });
}

export const saveTodoDoc = async (uid, todo) => {
    const ref = doc(db, "users", uid, "todos", todo.id);
    await setDoc(ref, {
        ...todo,
        createdAt: todo.createdAt || Date.now(),
    });
};

export const deleteTodoDoc = async (uid, todoId) => {
    await deleteDoc(doc(db, "users", uid, "todos", todoId));
};