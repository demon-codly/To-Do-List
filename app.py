from flask import Flask, request, jsonify
from flask_cors import CORS
from bson.objectid import ObjectId
from database import MongoDB
from datetime import datetime

app = Flask(__name__)
CORS(app)

db_instance = MongoDB()
db = db_instance.connect()
tasks_collection = db["tasks"]

def is_valid_date(date_str):
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except ValueError:
        return False

@app.route("/tasks", methods=["GET"])
def get_tasks():
    tasks = []
    for task in tasks_collection.find():
        tasks.append({
            "id": str(task["_id"]),
            "task": task["task"],
            "due_date": task.get("due_date", ""),
            "priority": task.get("priority", "low")
        })
    return jsonify(tasks)

@app.route("/tasks", methods=["POST"])
def add_task():
    data = request.json
    task = data.get("task")
    due_date = data.get("due_date", "")
    priority = data.get("priority", "low").lower()

    if not task:
        return jsonify({"error": "Task cannot be empty"}), 400
    if due_date and not is_valid_date(due_date):
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400
    if priority not in ["low", "medium", "high"]:
        return jsonify({"error": "Invalid priority. Choose 'low', 'medium', or 'high'."}), 400

    task_data = {"task": task, "due_date": due_date, "priority": priority}
    result = tasks_collection.insert_one(task_data)
    return jsonify({"message": f"Task '{task}' added successfully", "id": str(result.inserted_id)}), 201

@app.route("/tasks/<string:task_id>", methods=["DELETE"])
def delete_task(task_id):
    result = tasks_collection.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Task not found"}), 404
    return jsonify({"message": "Task deleted successfully"}), 200

if __name__ == "__main__":
    app.run()