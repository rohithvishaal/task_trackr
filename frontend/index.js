const API_PORT = 3000;
let API_BASE_URL = '';

if (window.location.hostname === 'localhost') {
    // Use the local IP for local development
    API_BASE_URL = `http://192.168.1.5:${API_PORT}`;
} else {
    // Use the current hostname for production/deployment
    API_BASE_URL = `http://${window.location.hostname}:${API_PORT}`;
}
const card = document.querySelector(".card")
const deleteTask = async (id) => {
    console.log("delete pressed")
    const response = await fetch(`${API_BASE_URL}/api/delete_task/${id}`)
    const data = await response.json()
    console.log(data)
}


card.addEventListener('click', (event) => {
    const taskCheckBox = event.target.closest('input[type=checkbox]')
    if (taskCheckBox) {
        const taskTodo = taskCheckBox.closest('.task-todo')
        const taskLabel = taskTodo.querySelector('.card-title')
        taskLabel.classList.toggle('checked')

    }
    // Use .closest() to see if the clicked element or its parent is a trash button
    const trashButton = event.target.closest('.trash-button');
    if (trashButton) {
        const taskContainer = trashButton.closest(".task-container")
        if (taskContainer) {
            const taskTodoDiv = taskContainer.querySelector('.task-todo')
            const id = taskTodoDiv.id.split('-').pop();
            deleteTask(id); // Pass the event to your handler
            taskContainer.remove()
        }
    }

    // You can do the same for the edit button
    const editButton = event.target.closest('.edit-button');

    if (editButton) {
        const taskContainer = editButton.closest('.task-container');
        let dataEditMode = taskContainer.getAttribute("data-edit-mode") === "true";

        if (!dataEditMode) {
            const taskLabel = taskContainer.querySelector('.card-title');
            const taskDescription = taskContainer.querySelector('.card-text');

            const currentTitle = taskLabel.textContent;
            const currentDescription = taskDescription?.textContent;

            // Create new input and textarea elements for THIS specific task
            const titleInput = document.createElement('input');
            titleInput.setAttribute("type", "text");
            titleInput.value = currentTitle;

            const descriptionTextArea = document.createElement("textarea");
            descriptionTextArea.textContent = currentDescription;

            // Replace the existing content with the newly created inputs
            taskLabel.replaceWith(titleInput);
            taskDescription.replaceWith(descriptionTextArea);

            editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="#f5a623" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            taskContainer.setAttribute("data-edit-mode", "true");
        } else {
            // When exiting edit mode, find the input and textarea elements *within* this task
            const titleInput = taskContainer.querySelector('input[type="text"]');
            const descriptionTextArea = taskContainer.querySelector('textarea');
            const id = taskContainer.querySelector('.task-todo').id.split('-').pop();

            // Recreate the label and paragraph with the updated values
            const updatedTitle = document.createElement('label');
            updatedTitle.classList.add('card-title');
            updatedTitle.setAttribute('for', `task-checkbox-${id}`);
            updatedTitle.textContent = titleInput.value.trim();

            const updatedDescription = document.createElement('p');
            updatedDescription.classList.add('card-text');
            updatedDescription.textContent = descriptionTextArea.value.trim();

            // Replace the input fields with the new elements
            titleInput.replaceWith(updatedTitle);
            descriptionTextArea.replaceWith(updatedDescription);

            // update your buttons and data attributes
            taskContainer.setAttribute("data-edit-mode", "false");
            editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="62" height="62" viewBox="0 0 24 24"
                                    fill="none" stroke="#f5a623" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon>
                                    <line x1="3" y1="22" x2="21" y2="22"></line>
                                    </svg>`;
            fetch(`${API_BASE_URL}/api/update_task`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: id,
                    title: titleInput.value.trim(),
                    description: descriptionTextArea.value.trim()
                })
            })
                .then(response => response.json())
                .then(data => console.log(data))

        }
    }
});

const addTaskToDOM = async (id, title, description) => {

    card.insertAdjacentHTML("beforeend", `
    <div class="task-container" data-edit-mode="false">
        <div id="task-checkbox-${id}" class="task-todo">
            <div class="task-checkbox">
                <input type="checkbox" value="${title}" name="task-checkbox-${id}">
            </div>
            <div class='task-content'>
                <label for="task-checkbox-${id}" class="card-title">${title.trim()}</label>
                <p class="card-text">${description.replace("\n", "<br>").trim()}</p>
            </div>
        </div>
        <div class="options">
            <button class="edit-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="62" height="62" viewBox="0 0 24 24"
                        fill="none" stroke="#f5a623" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon>
                        <line x1="3" y1="22" x2="21" y2="22"></line>
                </svg>
            </button>

            <button class="trash-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="62" height="62"
                        viewBox="0 0 24 24" fill="none" stroke="#f5a623" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        </div>
    </div>    
    `)
}

const loadTasks = async () => {
    const response = await fetch(`${API_BASE_URL}/api/tasks`)
    const data = await response.json()
    console.log(data)
    for (const task of data) {
        await addTaskToDOM(task.ID, task.title, task.description)
    }
    return true
}


loadTasks()

const openModalBtn = document.querySelector("#create-task")
const closeModalBtn = document.querySelector("#close-modal-btn")
const cancelModalBtn = document.querySelector("#cancel-modal-btn")
const modalOverlay = document.querySelector("#task-modal")
const taskForm = document.querySelector("#task-form")

const openModal = () => {
    modalOverlay.classList.add('open')
    taskForm.reset()
}

const closeModal = () => {
    modalOverlay.classList.remove('open')
}

openModalBtn.addEventListener('click', openModal)
closeModalBtn.addEventListener('click', closeModal)
cancelModalBtn.addEventListener('click', closeModal)

modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
        closeModal()
    }
})

taskForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const title = document.querySelector("#task-title").value
    const description = document.querySelector("#task-description").value
    console.log('New Task Submitted:', { title, description });
    const response = await fetch(`${API_BASE_URL}/api/create_task`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            description: description
        })
    })
    const data = await response.json()
    console.log(data)
    const id = data.lastInsertRowid
    addTaskToDOM(id, title, description)
    closeModal();
})



