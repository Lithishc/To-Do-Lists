document.addEventListener("DOMContentLoaded", function () {
    // Selectors
    const taskList = document.querySelector(".task-list");
    const taskInput = document.querySelector(".task-title");
    const taskDesc = document.querySelector(".task-desc");
    const taskListDropdown = document.querySelector(".task-list-dropdown");
    const taskDueDate = document.querySelector(".task-due-date");
    const taskAddButton = document.querySelector(".save-task");
    const menuTagInput = document.querySelector(".menu-tag-input");
    const sectionTitle = document.querySelector(".task-section h1"); // Section title
    const todayCount = document.getElementById("today-count");
    const upcomingCount = document.getElementById("upcoming-count");
    const personalCount = document.getElementById("personal-count");
    const workCount = document.getElementById("work-count");
    const allTasksCount = document.getElementById("all-tasks");

    let currentView = "Today"; // Default view is "Today"
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let editingIndex = null;

    // Save tasks to localStorage
    function saveTasksToLocalStorage() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Function to update task counts
    function updateTaskCounts() {
        const today = new Date().toISOString().split('T')[0];

        // Update counts for Today, Upcoming, Personal, Work, and All Tasks
        todayCount.textContent = tasks.filter(task => task.dueDate === today).length;
        upcomingCount.textContent = tasks.filter(task => task.dueDate > today).length;
        personalCount.textContent = tasks.filter(task => task.list === "Personal").length;
        workCount.textContent = tasks.filter(task => task.list === "Work").length;
        allTasksCount.textContent = tasks.length;

        // Update the task count in the section title
        const filteredTasks = getFilteredTasks();
        sectionTitle.querySelector(".task-count").textContent = filteredTasks.length;
    }

    // Function to get filtered tasks based on the current view
    function getFilteredTasks() {
        const today = new Date().toISOString().split('T')[0];
        if (currentView === "Today") {
            return tasks.filter(task => task.dueDate === today);
        } else if (currentView === "Upcoming") {
            return tasks.filter(task => task.dueDate > today);
        } else {
            return tasks; // "All Tasks" view
        }
    }

    // Function to render tasks
    function renderTasks() {
        taskList.innerHTML = "";

        const filteredTasks = getFilteredTasks();

        // Check if there are no tasks to display
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<li class="no-tasks">No tasks to display. Add a new task!</li>`;
            updateTaskCounts();
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

        updateTaskCounts();
    }

    // Event listener for menu navigation
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

            // Update the section title dynamically
            sectionTitle.textContent = this.textContent.trim();

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

        saveTasksToLocalStorage();
        taskInput.value = "";
        taskDesc.value = "";
        taskDueDate.value = "";
        renderTasks();
    });

    // Delete a task
    taskList.addEventListener("click", function (e) {
        if (e.target.matches(".delete-task")) {
            const taskElement = e.target.closest(".task-item");
            const index = taskElement.dataset.index;
            tasks.splice(index, 1);
            saveTasksToLocalStorage();
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

    // Initial render
    renderMenuTags();
    syncTaskTags();
    renderTasks();
});
   