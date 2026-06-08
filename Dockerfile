# 1. 깡통 슬림 버전 대신, 자바 설치 저장소가 완벽히 포함된 풀버전 파이썬 이미지 사용
FROM python:3.14-bookworm

# 2. 한 줄로 꼬임 없이 패키지 업데이트 후 자바 및 빌드 도구 한 방에 설치
RUN apt-get update && apt-get install -y --no-install-recommends openjdk-17-jdk g++ && rm -rf /var/lib/apt/lists/*

# 자바 환경변수 경로 시스템에 확실하게 고정
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$PATH:$JAVA_HOME/bin

# 3. 서버 내부 작업 디렉토리 설정
WORKDIR /app

# 4. 의존성 파일 복사 및 필수 빌드 도구 설치
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# 5. 나머지 백엔드 소스 코드 전부 복사
COPY backend/ .

# 6. Render 포트 설정 및 서버 가동 명령어
EXPOSE 10000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]