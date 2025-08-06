import Database from "better-sqlite3"
const db = new Database('./task_trackr.db', { verbose: console.log })

export const getTasks = () => {
    const getTasksResult = db.prepare("SELECT id, title, description, createdAt from tasktrackr")
    const tasks = []
    for (const task of getTasksResult.iterate()) {
        tasks.push(task)
    }
    return tasks
}

export const addTask = (title, description) => {
    if (!title || !description) return "{error : All fields are required}"
    const insertTask = db.prepare("INSERT INTO tasktrackr(title, description) VALUES (:title, :description)")
    const result = insertTask.run({
        title: title,
        description: description
    })
    return result
}

export const updateTask = (id, title, description) => {
    const updateTask = db.prepare("UPDATE tasktrackr SET title = :title, description = :description where id=:id")
    const result = updateTask.run({
        id: id,
        title: title,
        description: description
    })
    return result
}

export const deleteTask = ({ id = "", title = "" }) => {
    const deleteTask = db.prepare("DELETE FROM tasktrackr WHERE id=:id or title=:title")
    const result = deleteTask.run({
        id: id,
        title: title
    })
    return result
}