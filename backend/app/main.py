from fastapi import FastAPI

app = FastAPI(
    title="FixIt API",
    description="Backend API for the FixIt service marketplace.",
    version="0.1.0",
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to FixIt API",
        "status": "running",
    }