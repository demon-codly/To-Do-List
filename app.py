from flask import Flask, request, jsonify
import os
import json
from datetime import datetime

app = Flask(__name__)

# File to store tasks
TASK_FILE = "tasks.json"

# Load tasks from the file
def load_tasks():
    if os.path.exists(TASK_FILE):
        with open(TASK_FILE, "r") as file:
            return json.load(file)
    return []

# Save tasks to the file
def save_tasks():
    with open(TASK_FILE, "w") as file:
        json.dump(tasks, file)

# Initialize tasks
tasks = load_tasks()

def is_valid_date(date_str):
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except ValueError:
        return False

# API to list all tasks
@app.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify(tasks)

# API to add a task
@app.route("/tasks", methods=["POST"])
def add_task():
    data = request.json
    task = data.get("task")
    due_date = data.get("due_date", "")
    priority = data.get("priority", "low").lower()

    # Validate inputs
    if not task:
        return jsonify({"error": "Task cannot be empty"}), 400
    if due_date and not is_valid_date(due_date):
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400
    if priority not in ["low", "medium", "high"]:
        return jsonify({"error": "Invalid priority. Choose 'low', 'medium', or 'high'."}), 400

    # Prevent duplicate tasks
    for existing_task in tasks:
        if existing_task["task"] == task:
            return jsonify({"error": f"Task '{task}' already exists!"}), 400

    # Add task
    tasks.append({"task": task, "due_date": due_date, "priority": priority})
    save_tasks()
    return jsonify({"message": f"Task '{task}' added successfully"}), 201

# API to delete a task
@app.route("/tasks/<string:task_name>", methods=["DELETE"])
def delete_task(task_name):
    global tasks
    tasks = [task for task in tasks if task["task"] != task_name]
    save_tasks()
    return jsonify({"message": f"Task '{task_name}' deleted successfully"}), 200

if __name__ == "__main__":
    app.run(debug=True)