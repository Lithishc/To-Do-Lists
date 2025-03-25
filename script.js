document.addEventListener("DOMContentLoaded", function () {
    // Selectors
    const taskList = document.querySelector(".task-list");
    const taskInput = document.querySelector(".task-title");
    const taskDesc = document.querySelector(".task-desc");
    const taskListDropdown = document.querySelector(".task-list-dropdown");
    const taskDueDate = document.querySelector(".task-due-date");
    const taskAddButton = document.querySelector(".save-task");
    const tagInput = document.querySelector(".tag-input");
    const tagContainer = document.querySelector(".tag-container");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let editingIndex = null;

    // Function to update Local Storage
    function updateLocalStorage() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Function to update task counts
    function updateTaskCounts() {
        const today = new Date().toISOString().split('T')[0];

        document.getElementById("today-count").textContent = tasks.filter(task => task.dueDate === today).length;
        document.getElementById("upcoming-count").textContent = tasks.filter(task => task.dueDate > today).length;
        document.getElementById("personal-count").textContent = tasks.filter(task => task.list === "Personal").length;
        document.getElementById("work-count").textContent = tasks.filter(task => task.list === "Work").length;
    }

    // Function to render tasks
    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            const taskItem = document.createElement("li");
            taskItem.innerHTML = `
                <input type="checkbox" ${task.completed ? "checked" : ""} data-index="${index}">
                <strong>${task.title}</strong> - <small>(${task.list})</small> - Due: ${task.dueDate || "No Date"}
                <button class="edit-task" data-index="${index}">✏</button>
                <button class="delete-task" data-index="${index}">🗑</button>
            `;
            taskList.appendChild(taskItem);
        });

        updateLocalStorage();
        updateTaskCounts();
    }

    // Add or update a task
    taskAddButton.addEventListener("click", function () {
        const title = taskInput.value.trim();
        const description = taskDesc.value.trim();
        const list = taskListDropdown.value;
        const dueDate = taskDueDate.value;

        if (title === "") {
            alert("Task title cannot be empty!");
            return;
        }

        if (editingIndex !== null) {
            tasks[editingIndex] = { title, description, completed: false, list, dueDate };
            editingIndex = null;
            taskAddButton.textContent = "💾 Add Task";
        } else {
            tasks.push({ title, description, completed: false, list, dueDate });
        }

        taskInput.value = "";
        taskDesc.value = "";
        taskDueDate.value = "";
        renderTasks();
    });

    // Delete a task
    taskList.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete-task")) {
            const index = e.target.getAttribute("data-index");
            tasks.splice(index, 1);
            renderTasks();
        }
    });

    // Edit a task
    taskList.addEventListener("click", function (e) {
        if (e.target.classList.contains("edit-task")) {
            const index = e.target.getAttribute("data-index");
            taskInput.value = tasks[index].title;
            taskDesc.value = tasks[index].description || "";
            taskListDropdown.value = tasks[index].list;
            taskDueDate.value = tasks[index].dueDate || "";

            taskAddButton.textContent = "💾 Save Task";
            editingIndex = index;
        }
    });

    // Load tasks on page load
    renderTasks();
});
