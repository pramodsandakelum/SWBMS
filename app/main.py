from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Smart Waste Bin API running!"}