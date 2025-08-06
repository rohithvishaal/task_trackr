const express = require("express")
const { getTasks, addTask, deleteTask, updateTask } = require("./db_ops")
const path = require("node:path")
const cors = require('cors')

const app = express()
const port = 3000
const basePath = path.resolve(__dirname, "..")
const publicDirectoryPath = path.join(basePath, 'frontend');

app.use(express.static(publicDirectoryPath))
app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.sendFile(publicDirectoryPath + "/index.html")
})

app.get("/api/tasks", (req, res) => {
    res.send(getTasks())
})

app.post("/api/create_task", (req, res) => {
    const title = req.body.title
    const description = req.body.description
    res.send(addTask(title, description))
})

app.get("/api/delete_task/:id", (req, res) => {
    res.send(deleteTask({ id: req.params.id }))
})

app.post("/api/update_task", (req, res) => {
    const title = req.body.title
    const description = req.body.description
    const id = req.body.id
    res.send(updateTask(id, title, description))
})

app.listen(port, () => {
    console.log(`Server is listening on ${port}`)
})