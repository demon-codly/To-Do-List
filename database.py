import os
from pymongo import MongoClient
from dotenv import load_dotenv

class MongoDB:
    def __init__(self):
        load_dotenv()  # Load environment variables from .env file
        self.uri = os.getenv("MONGODB_URI")
        self.database_name = os.getenv("DATABASE_NAME")
        if not self.uri or not self.database_name:
            raise ValueError("MONGODB_URI and DATABASE_NAME must be set in the .env file.")

    def connect(self):
        try:
            client = MongoClient(self.uri)
            print("Connected to MongoDB successfully.")
            db = client[self.database_name]
            self.initialize_collections(db)
            return db
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            raise

    @staticmethod
    def initialize_collections(db):
        """
        Ensures that necessary collections exist and sets up basic indexes.
        """
        collections = db.list_collection_names()
        if "tasks" not in collections:
            print("Creating 'tasks' collection...")
            db.create_collection("tasks")
            db["tasks"].create_index("priority")
            db["tasks"].create_index("due_date")
        else:
            print("'tasks' collection already exists.")

if __name__ == "__main__":
    # For standalone execution, validate the connection and initialize collections
    db_instance = MongoDB()
    db = db_instance.connect()
    print("Database setup completed.")
