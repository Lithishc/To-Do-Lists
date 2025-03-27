document.addEventListener("DOMContentLoaded", function () {
    // Selectors
    const taskList = document.querySelector(".task-list");
    const taskInput = document.querySelector(".task-title");
    const taskDesc = document.querySelector(".task-desc");
    const taskListDropdown = document.querySelector(".task-list-dropdown");
    const taskDueDate = document.querySelector(".task-due-date");
    const taskAddButton = document.querySelector(".save-task");
    const taskDeleteButton = document.querySelector(".delete-task");
    const sectionTitle = document.querySelector(".task-section h1"); 
    const todayCount = document.getElementById("today-count");
    const upcomingCount = document.getElementById("upcoming-count");
    const personalCount = document.getElementById("personal-count");
    const workCount = document.getElementById("work-count");
    const completed = document.getElementById("completed-count");
    const allTasksCount = document.getElementById("all-tasks");
    const searchInput = document.getElementById("search-task"); // Search bar selector

    let currentView = "Today"; // Default view is "Today"
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let editingIndex = null;
    let lists = ["Personal", "Work"]; // Default lists

    // Save tasks to localStorage
    function saveTasksToLocalStorage() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Function to update task counts
    function updateTaskCounts() {
        const today = new Date().toISOString().split('T')[0];
    
        //Exclude completed tasks from all sections except "Completed"
        todayCount.textContent = tasks.filter(task => task.dueDate === today && !task.completed).length;
        upcomingCount.textContent = tasks.filter(task => task.dueDate > today && !task.completed).length;
        personalCount.textContent = tasks.filter(task => task.list === "Personal" && !task.completed).length;
        workCount.textContent = tasks.filter(task => task.list === "Work" && !task.completed).length;
        completed.textContent = tasks.filter(task => task.completed).length; 
        allTasksCount.textContent = tasks.filter(task => !task.completed).length; 
    
        //Update the task count in the section title dynamically
        if (sectionTitle.querySelector(".task-count")) {
            sectionTitle.querySelector(".task-count").textContent = getFilteredTasks().length;
        }
    }
    
    

    // Function to get filtered tasks based on the current view
    function getFilteredTasks() {
        const today = new Date().toISOString().split('T')[0];
    
        if (currentView === "Today") {
            return tasks.filter(task => task.dueDate === today && !task.completed); // ✅ Exclude completed tasks
        } else if (currentView === "Upcoming") {
            return tasks.filter(task => task.dueDate > today && !task.completed); // ✅ Exclude completed tasks
        } else if (currentView === "Completed") { 
            return tasks.filter(task => task.completed); // ✅ Only show completed tasks
        } else if (lists.includes(currentView)) {
            return tasks.filter(task => task.list === currentView && !task.completed); // ✅ Exclude completed
        } else {
            return tasks.filter(task => !task.completed); // ✅ Exclude completed from "All Tasks"
        }
    }
    
    
    

    // Function to render tasks
    function renderTasks() {
        taskList.innerHTML = "";
        const filteredTasks = getFilteredTasks();
    
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<li class="no-tasks">No tasks to display. Add a new task!</li>`;
            updateTaskCounts();
            return;
        }
    
        filteredTasks.forEach((task, index) => {
            const taskItem = document.createElement("li");
            taskItem.classList.add("task-item");
    
            if (task.completed) {
                taskItem.classList.add("completed-task"); // ✅ Styling for completed tasks
            }
    
            taskItem.innerHTML = `
                <div class="task-main">
                    <input type="checkbox" ${task.completed ? "checked" : ""} data-index="${index}">
                    <div class="task-info">
                        <span class="task-text ${task.completed ? "completed-text" : ""}">${task.title}</span>
                        <div class="task-meta">
                            <span class="due-date">${task.dueDate || "No Date"}</span>
                            <span class="list-tag">${task.list}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-task" data-index="${index}">✏️Edit</button>
                    <button class="delete-task" data-index="${index}" style="color: red; font-weight: bold;">🗑</button>
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
            } else if (this.textContent.includes("Personal")) {
                currentView = "Personal";
            } else if (this.textContent.includes("Work")) {
                currentView = "Work";
            } else if (this.textContent.includes("Completed")) {
                currentView = "Completed";
            }else {
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
            taskAddButton.textContent = "Add Task";
        } else {
            tasks.push({ title, description, completed: false, list, dueDate });
        }

        saveTasksToLocalStorage();
        taskInput.value = "";
        taskDesc.value = "";
        taskDueDate.value = "";
        renderTasks();
    });

    //Delete button
    taskDeleteButton.addEventListener("click", function () {
        if (editingIndex !== null) {
            tasks.splice(editingIndex, 1);
            saveTasksToLocalStorage();
            renderTasks();
            updateSectionTitle();
            
            // Clear the input fields
            taskInput.value = "";
            taskDesc.value = "";
            taskDueDate.value = "";
            taskListDropdown.value = lists[0]; // Reset dropdown to default
            taskAddButton.textContent = "Add Task"; // Reset button text
            editingIndex = null; // Reset editing mode
        }
    });

    // Delete a task
    taskList.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete-task")) {
            const index = e.target.getAttribute("data-index");
            tasks.splice(index, 1);
            saveTasksToLocalStorage();
            renderTasks();
            updateSectionTitle()
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

            taskAddButton.textContent = "Update Task";
            editingIndex = index;
        }
    });

    // Update task completion status
    taskList.addEventListener("change", function (e) {
        if (e.target.type === "checkbox") {
            const taskItem = e.target.closest(".task-item");
            const taskTitle = taskItem.querySelector(".task-text").textContent;
    
            // Find the correct task in the `tasks` array
            const taskIndex = tasks.findIndex(task => task.title === taskTitle);
    
            if (taskIndex !== -1) {
                tasks[taskIndex].completed = e.target.checked; // Toggle completion
                saveTasksToLocalStorage();
                updateTaskCounts();
                updateSectionTitle(); 
                renderTasks(); // 🔄 Re-render to move completed tasks correctly
            }
        }
    });
    
    
    function updateSectionTitle() {
        if (sectionTitle.querySelector(".task-count")) {
            sectionTitle.querySelector(".task-count").textContent = getFilteredTasks().length;
        } else {
            sectionTitle.innerHTML = `All Tasks <span class="task-count">${getFilteredTasks().length}</span>`;
        }
    }

    // Load tasks from localStorage and render them
    function loadTasksFromLocalStorage() {
        tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        renderTasks();
    }

    function searchTasks() {
        const query = searchInput.value.toLowerCase().trim();
        const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(query));

        // Update the task section title dynamically
        if (query.length > 0) {
            sectionTitle.innerHTML = `Search Results for "<span style="color: blue;">${query}</span>"`;
        } else {
            sectionTitle.textContent = currentView; // Reset title to current section
        }

        // Render only the searched tasks
        renderFilteredTasks(filteredTasks);
    }

    // Function to render searched tasks
    function renderFilteredTasks(filteredTasks) {
        taskList.innerHTML = ""; // Clear the list

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<li class="no-tasks">No tasks found.</li>`;
            return;
        }

        filteredTasks.forEach((task, index) => {
            const taskItem = document.createElement("li");
            taskItem.classList.add("task-item");
            if (task.completed) taskItem.classList.add("completed-task");

            taskItem.innerHTML = `
                <div class="task-main">
                    <input type="checkbox" ${task.completed ? "checked" : ""} data-index="${index}">
                    <div class="task-info">
                        <span class="task-text ${task.completed ? "completed-text" : ""}">${task.title}</span>
                        <div class="task-meta">
                            <span class="due-date">${task.dueDate || "No Date"}</span>
                            <span class="list-tag">${task.list}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-task" data-index="${index}">✏️Edit</button>
                    <button class="delete-task" data-index="${index}">🗑</button>
                </div>
            `;

            taskList.appendChild(taskItem);
        });
    }

    // Event listener for search input
    searchInput.addEventListener("input", searchTasks);

    // Show task details in input fields when clicking a task
    taskList.addEventListener("click", function (e) {
        const taskItem = e.target.closest(".task-item");
        if (taskItem && !e.target.classList.contains("edit-task") && !e.target.classList.contains("delete-task")) {
            const index = Array.from(taskList.children).indexOf(taskItem);
            const task = tasks[index];

            taskInput.value = task.title;
            taskDesc.value = task.description || "";
            taskListDropdown.value = task.list;
            taskDueDate.value = task.dueDate || "";

            taskAddButton.textContent = "Update Task";
            editingIndex = index;
        }
    });

    // Initial render
    loadTasksFromLocalStorage(); // Load and display stored tasks
    renderMenuTags();
    syncTaskTags();
    renderLists();
});
