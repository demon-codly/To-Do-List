document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const taskDate = document.getElementById("taskDate");
  const taskPriority = document.getElementById("taskPriority");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");
  const loader = document.getElementById("loader");

  const BASE_URL = "https://to-do-list-e3mj.onrender.com";

  const PRIORITIES = { LOW: "low", MEDIUM: "medium", HIGH: "high" };

  function toggleLoader(show) {
    loader.style.display = show ? "block" : "none";
  }

  async function loadTasksFromServer() {
    toggleLoader(true);
    try {
      const response = await fetch(`${BASE_URL}/tasks`);
      if (!response.ok) throw new Error("Failed to load tasks");
      const tasks = await response.json();
      taskList.innerHTML = "";
      tasks.forEach(({ id, task, due_date, priority }) => {
        addTaskToList(id, task, due_date, priority);
      });
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      toggleLoader(false);
    }
  }

  addTaskBtn.addEventListener("click", async () => {
    const taskText = taskInput.value.trim();
    const dueDate = taskDate.value;
    const priority = taskPriority.value.toLowerCase();

    if (!taskText) {
      alert("Task cannot be empty!");
      return;
    }

    if (dueDate && isNaN(new Date(dueDate))) {
      alert("Please enter a valid date.");
      return;
    }

    toggleLoader(true);
    try {
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: taskText, due_date: dueDate, priority }),
      });

      const result = await response.json();
      if (response.ok) {
        loadTasksFromServer();
        taskInput.value = "";
        taskDate.value = "";
        taskPriority.value = PRIORITIES.LOW;
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      toggleLoader(false);
    }
  });

  function addTaskToList(id, task, dueDate, priority) {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="task-details">
        <span class="task-text"></span><br>
        <span class="task-date"></span><br>
        <span class="task-priority"></span>
      </div>
      <button class="deleteBtn" aria-label="Delete Task">Delete</button>
    `;
    li.querySelector(".task-text").textContent = task;
    li.querySelector(".task-date").textContent = dueDate || "No due date";
    li.querySelector(".task-priority").textContent = `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`;

    li.querySelector(".deleteBtn").addEventListener("click", async () => {
      toggleLoader(true);
      try {
        const response = await fetch(`${BASE_URL}/tasks/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete task");
        li.remove();
      } catch (error) {
        console.error("Error deleting task:", error);
      } finally {
        toggleLoader(false);
      }
    });

    taskList.appendChild(li);
  }

  loadTasksFromServer();
});