document.addEventListener("DOMContentLoaded", function () {
    // Selectors
    const taskList = document.querySelector(".task-list");
    const taskInput = document.querySelector(".task-title");
    const taskDesc = document.querySelector(".task-desc");
    const taskListDropdown = document.querySelector(".task-list-dropdown");
    const taskDueDate = document.querySelector(".task-due-date");
    const taskAddButton = document.querySelector(".save-task");
    const menuTagInput = document.querySelector(".menu-tag-input"); // Ensure this selector matches your HTML structure

    let currentView = "Today"; // Default view is "Today"
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let editingIndex = null;

    // Function to update task counts
    function updateTaskCounts() {
        const today = new Date().toISOString().split('T')[0];

        // Update counts for Today, Upcoming, Personal, and Work
        document.getElementById("today-count").textContent = tasks.filter(task => task.dueDate === today).length;
        document.getElementById("upcoming-count").textContent = tasks.filter(task => task.dueDate > today).length;
        document.getElementById("personal-count").textContent = tasks.filter(task => task.list === "Personal").length;
        document.getElementById("work-count").textContent = tasks.filter(task => task.list === "Work").length;

        // Update the total task count
        document.getElementById("all-tasks").textContent = tasks.length;
    }

    function renderTasks() {
        taskList.innerHTML = "";
    
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
    
        // Filter tasks based on the current view
        let filteredTasks = tasks;
        if (currentView === "Today") {
            filteredTasks = tasks.filter(task => task.dueDate === today);
        } else if (currentView === "Upcoming") {
            filteredTasks = tasks.filter(task => task.dueDate > today);
        }
    
        // Check if there are no tasks to display
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<li class="no-tasks">No tasks to display. Add a new task!</li>`;
            return;
        }
    
        // Render the filtered tasks
        filteredTasks.forEach((task, index) => {
            const taskItem = document.createElement("li");
            taskItem.classList.add("task-item");
            taskItem.innerHTML = `
                <div class="task-main">
                    <input type="checkbox" ${task.completed ? "checked" : ""} data-index="${index}">
                    <div class="task-info">
                        <span class="task-text">${task.title}</span>
                        <div class="task-meta">
                            <span class="due-date">${task.dueDate || "No Date"}</span>
                            <span class="list-tag">${task.list}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-task" data-index="${index}">Edit</button>
                    <button class="delete-task" data-index="${index}">🗑</button>
                </div>
            `;
            taskList.appendChild(taskItem);
        });
    
        // Update task counts after rendering
        updateTaskCounts();
    }

    document.querySelectorAll(".menu-section ul li").forEach(menuItem => {
        menuItem.addEventListener("click", function () {
            // Remove the "active" class from all menu items
            document.querySelectorAll(".menu-section ul li").forEach(item => item.classList.remove("active"));

            // Add the "active" class to the clicked menu item
            this.classList.add("active");

            // Update the current view based on the clicked menu item
            if (this.textContent.includes("Today")) {
                currentView = "Today";
            } else if (this.textContent.includes("Upcoming")) {
                currentView = "Upcoming";
            } else {
                currentView = "All Tasks";
            }

            // Re-render tasks based on the new view
            renderTasks();
        });
    });

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
        if (e.target.matches(".delete-task")) {
            const taskElement = e.target.closest(".task-item"); // Find closest task container
            const index = taskElement.dataset.index; // Use dataset instead of getAttribute
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

            taskAddButton.textContent = "Save Task";
            editingIndex = index;
        }
    });

    // Attach event listeners
    if (menuTagInput) {
        menuTagInput.addEventListener("keypress", addMenuTag);
    }

    // Load tasks and tags on page load
    renderMenuTags();
    syncTaskTags();
    renderTasks();
});