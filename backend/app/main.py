# FastAPI 실행을 위한 기본 코드

from fastapi import FastAPI

app = FastAPI()

# 예시 API
@app.get("/api/hello")
def read_root():
	return {"message": "Hello, FastAPI!"}
