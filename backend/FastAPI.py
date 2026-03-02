from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials= True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    task: str
    task_description: str
    priority: str
    task_date: str

@app.post("/create_task")
def create_task(task: Task):
    return {
        "status": "success",
        "message": f"Task '{task.task}' created successfully with description '{task.task_description}' and priority '{task.priority}' on date '{task.task_date}'."
    }


class UpdateTask(BaseModel):
    task_id: int
    task: str
    task_description: str
    priority: str
    task_date: str


@app.put("/update_task")
def update_task(task: UpdateTask):
    return {
        "status": "success",
        "message": f"Task {task.task} with Task ID {task.task_id} updated successfully."
    }


class DeleteTask(BaseModel):
    task_id: int
    task: str


@app.delete("/delete_task")
def delete_task(task: DeleteTask):
    return {
        "status": "success",
        "message": f"Task {task.task} with Task ID {task.task_id} deleted successfully."
    }
