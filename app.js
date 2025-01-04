document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");

  // Load tasks from the server
  loadTasksFromServer();

  // Add a task
  addTaskBtn.addEventListener("click", async () => {
    const taskText = taskInput.value.trim();
    const taskDate = document.getElementById("taskDate").value;
    const taskPriority = document.getElementById("taskPriority").value;

    if (!taskText) {
      alert("Task cannot be empty!");
      return;
    }

    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: taskText,
          due_date: taskDate,
          priority: taskPriority,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        addTaskToList(taskText, taskDate, taskPriority);
        taskInput.value = "";
        document.getElementById("taskDate").value = "";
        document.getElementById("taskPriority").value = "Low";
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  });

  // Add task to the list
  function addTaskToList(task, date, priority) {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="task-details">
        <span class="task-text">${task}</span><br>
        <span class="task-date">${date}</span><br>
        <span class="task-priority">${priority} Priority</span>
      </div>
      <button class="deleteBtn">Delete</button>
    `;

    li.querySelector(".deleteBtn").addEventListener("click", async () => {
      try {
        const response = await fetch(`/tasks/${task}`, { method: "DELETE" });
        const result = await response.json();
        if (response.ok) {
          li.remove();
        } else {
          alert(result.error);
        }
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    });

    taskList.appendChild(li);
  }

  // Load tasks from the server
  async function loadTasksFromServer() {
    try {
      const response = await fetch("/tasks");
      const tasks = await response.json();
      tasks.forEach(({ task, due_date, priority }) => {
        addTaskToList(task, due_date, priority);
      });
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  }
});