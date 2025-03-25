document.addEventListener("DOMContentLoaded", loadTasks);

function addTask() {
    let taskInput = document.getElementById("taskInput").value;
    let priority = document.getElementById("priority").value;
    let dueDate = document.getElementById("dueDate").value;
    if (taskInput === "") return alert("Task cannot be empty");
    
    let task = { text: taskInput, priority, dueDate, completed: false, subtasks: [] };
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    
    document.getElementById("taskInput").value = "";
    loadTasks();
}

function loadTasks() {
    let taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.forEach((task, index) => {
        // Ensure subtasks is always an array
        if (!task.subtasks) {
            task.subtasks = [];
        }

        let li = document.createElement("li");
        li.innerHTML = `
            <span onclick="editTask(${index})">${task.text} (Priority: ${task.priority}) - Due: ${task.dueDate}</span>
            <button onclick="deleteTask(${index})">Delete</button>
            <button onclick="toggleComplete(${index})">${task.completed ? 'Undo' : 'Complete'}</button>
            <button onclick="addSubtask(${index})">Add Subtask</button>
            <ul id="subtasks-${index}">
                ${task.subtasks.map((sub, i) => `<li>${sub} <button onclick="deleteSubtask(${index}, ${i})">X</button></li>`).join('')}
            </ul>
        `;
        taskList.appendChild(li);
    });

    // Save the fixed tasks back to localStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


function deleteTask(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}

function editTask(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let newTaskText = prompt("Edit task:", tasks[index].text);
    if (newTaskText !== null) {
        tasks[index].text = newTaskText;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        loadTasks();
    }
}

function toggleComplete(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}

function addSubtask(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let subtaskText = prompt("Enter subtask:");
    if (subtaskText) {
        tasks[index].subtasks.push(subtaskText);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        loadTasks();
    }
}

function deleteSubtask(taskIndex, subtaskIndex) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks[taskIndex].subtasks.splice(subtaskIndex, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}
