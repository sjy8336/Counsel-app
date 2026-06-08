# 1. 지영님의 개발 환경과 똑같은 파이썬 3.14 버전을 베이스로 지정
FROM python:3.14-slim

# 2. 보안 에러(Permission denied)를 피하기 위해 가상 컴퓨터 조립 단계에서 자바와 빌드 도구 설치
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 자바 환경변수 경로 시스템에 확실하게 고정
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$PATH:$JAVA_HOME/bin

# 3. 서버 내부 작업 디렉토리 설정
WORKDIR /app

# 4. 의존성 파일 복사 및 필수 빌드 도구 설치 (최신 파이썬 환경 대응)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# 5. 나머지 백엔드 소스 코드 전부 복사
COPY backend/ .

# 6. Render 포트 개방 및 서버 가동 명령어 (포트 번호는 10000 고정)
EXPOSE 10000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]