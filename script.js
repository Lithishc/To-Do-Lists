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

    const addNewListButton = document.querySelector(".add-new-list"); // "Add New List" button
    const listMenu = document.querySelector(".menu-section ul:nth-child(2)"); // List menu
    let lists = ["Personal", "Work"]; // Default lists

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
        } else if (lists.includes(currentView)) { // If viewing a specific list
            return tasks.filter(task => task.list === currentView);
        } else {
            return tasks; // Default to showing all tasks
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

    // Function to render lists in the sidebar and dropdown
    function renderLists() {
        listMenu.innerHTML = `
            <li>🟠 Personal <span id="personal-count">0</span></li>
            <li>🔵 Work <span id="work-count">0</span></li>
            <li class="add-new-list">➕ Add New List</li>
        `;

        // Add new lists dynamically
        lists.forEach((list, index) => {
            if (index > 1) { // Skip default lists
                const listItem = document.createElement("li");
                listItem.innerHTML = `${list} <span id="${list.toLowerCase()}-count">0</span>`;
                listMenu.insertBefore(listItem, listMenu.lastChild);
            }
        });

        // Update dropdown options
        taskListDropdown.innerHTML = lists.map(list => `<option value="${list}">${list}</option>`).join("");

        // Reattach event listener for "Add New List"
        attachAddNewListListener();
    }

    // Function to attach event listener for "Add New List"
    function attachAddNewListListener() {
        const addNewListButton = document.querySelector(".add-new-list");
        addNewListButton.addEventListener("click", function () {
            const inputField = document.createElement("input");
            inputField.type = "text";
            inputField.placeholder = "Enter new list name";
            inputField.classList.add("new-list-input");

            const saveButton = document.createElement("button");
            saveButton.textContent = "Save";
            saveButton.classList.add("save-new-list");

            // Replace the "Add New List" button with the input and save button
            addNewListButton.replaceWith(inputField);
            listMenu.appendChild(saveButton);

            // Save the new list
            saveButton.addEventListener("click", function () {
                const newListName = inputField.value.trim();
                if (newListName && !lists.includes(newListName)) {
                    lists.push(newListName);
                    renderLists();
                } else if (lists.includes(newListName)) {
                    alert("This list already exists!");
                }
                inputField.remove();
                saveButton.remove();
                renderLists();
            });
        });
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
            } else if (this.textContent.includes("Personal")) {
                currentView = "Personal";
            } else if (this.textContent.includes("Work")) {
                currentView = "Work";
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

    // Update task completion status
    taskList.addEventListener("change", function (e) {
        if (e.target.type === "checkbox") {
            const index = e.target.dataset.index;
            tasks[index].completed = e.target.checked;
            saveTasksToLocalStorage();
            renderTasks();
        }
    });

    // Initial render
    renderMenuTags();
    syncTaskTags();
    renderTasks();
    renderLists();
});
