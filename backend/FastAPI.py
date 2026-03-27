from fastapi import FastAPI
from pydantic import BaseModel, Field, field_validator
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from typing import Literal


app = FastAPI()

# cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200","http://127.0.0.1:4200"],
    allow_credentials= True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    task: str = Field(..., min_length=1, max_length=255)
    task_description: str = Field(default="", max_length=2000)
    priority: Literal["low", "medium", "high"]
    task_date: str = Field(default="")

    @field_validator("task")
    @classmethod
    def task_title_not_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Task title cannot be empty.")
        return cleaned

    @field_validator("task_date")
    @classmethod
    def validate_task_date(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            return ""
        date.fromisoformat(cleaned)
        return cleaned

@app.post("/create_task")
def create_task(task: Task):
    return {
        "status": "success",
        "message": f"Task '{task.task}' created successfully with description '{task.task_description}' and priority '{task.priority}' on date '{task.task_date}'."
    }


class UpdateTask(BaseModel):
    task_id: int
    task: str = Field(..., min_length=1, max_length=255)
    task_description: str = Field(default="", max_length=2000)
    priority: Literal["low", "medium", "high"]
    task_date: str = Field(default="")

    @field_validator("task")
    @classmethod
    def update_task_title_not_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Task title cannot be empty.")
        return cleaned

    @field_validator("task_date")
    @classmethod
    def validate_update_task_date(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            return ""
        date.fromisoformat(cleaned)
        return cleaned


@app.put("/update_task")
def update_task(task: UpdateTask):
    return {
        "status": "success",
        "message": f"Task {task.task} with Task ID {task.task_id} updated successfully."
    }


class DeleteTask(BaseModel):
    task_id: int = Field(..., ge=1)
    task: str = Field(..., min_length=1, max_length=255)


@app.delete("/delete_task")
def delete_task(task: DeleteTask):
    return {
        "status": "success",
        "message": f"Task {task.task} with Task ID {task.task_id} deleted successfully."
    }

class CreateColumnRequest(BaseModel):
    column_id: str = Field(..., min_length=1, max_length=128)
    column_name: str = Field(..., min_length=1, max_length=64)
    color_index: int = Field(..., ge=0)

@app.post("/create_column")
def create_column(data: CreateColumnRequest):
    return {
        "status": "success",
        "message": f"Column '{data.column_name}' created successfully with ID '{data.column_id}' and color index {data.color_index}."
    }

class UpdateColumnRequest(BaseModel):
    column_id: str = Field(..., min_length=1, max_length=128)
    column_name: str = Field(..., min_length=1, max_length=64)

@app.put("/update_column")
def update_column(data: UpdateColumnRequest):
    return {
        "status": "success",
        "message": f"Column '{data.column_id}' renamed to '{data.column_name}' successfully."
    }

class DeleteColumnRequest(BaseModel):
    column_id: str = Field(..., min_length=1, max_length=128)
    column_name: str = Field(..., min_length=1, max_length=64)
    fallback_column_id: str | None = None

@app.delete("/delete_column")
def delete_column(data: DeleteColumnRequest):
    fallback_text = " Tasks in this column were deleted."
    return {
        "status": "success",
        "message": f"Column '{data.column_name}' with ID '{data.column_id}' deleted successfully.{fallback_text}"
    }

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1, max_length=128)

@app.post("/login")
def login(data: LoginRequest):
    # Validate username and password
    if not data.username or not data.password:
        return {
            "status": "error",
            "message": "Username and password are required."
        }
    
    return {
        "status": "success",
        "message": f"User '{data.username}' logged in successfully with password validated."
    }

# google sign in 
class GoogleLoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)
    name: str = Field(..., min_length=1, max_length=100)

@app.post("/google_login")
def google_login(data: GoogleLoginRequest):
    return {
        "status": "success",
        "message": f"Google user '{data.name}' ({data.email}) logged in successfully."
    }

class Registerrequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    display_name: str = Field(..., min_length=1, max_length=100)

@app.post("/register")
def register(data: Registerrequest):
    return{ 
        "status": "success",
        "message": f"User '{data.username}' with display name '{data.display_name}' registered successfully."
    }

class LogoutRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)

@app.post("/logout")
def logout(data: LogoutRequest):
    response = {"message" : f"User '{data.username}' logged out successfully."}
    return response

# profile update

class UpdateProfileRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)
    new_username: str | None = None
    new_display_name: str | None = None

@app.put("/update_profile")
def update_profile(data: UpdateProfileRequest):
    changes = []
    if data.new_username:
        changes.append(f"username → '{data.new_username}'")
    if data.new_display_name:
        changes.append(f"display name → '{data.new_display_name}'")
    return {
        "status": "success",
        "message": f"Profile for '{data.username}' updated: {', '.join(changes) if changes else 'no changes'}."
    }
