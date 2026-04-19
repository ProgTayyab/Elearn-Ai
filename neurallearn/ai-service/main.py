from fastapi import FastAPI

app = FastAPI(title="NeuralLearn AI Service")

@app.get("/")
async def root():
    return {"message": "Welcome to NeuralLearn AI Service"}
