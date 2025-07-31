#!/bin/bash
echo "Stopping existing application..."
sudo pgrep -f "node.*dist/main" | sudo xargs kill || true

echo "Starting new application..."
# 현재 사용자의 홈 디렉토리 가져오기
USER_HOME=$(eval echo ~$SUDO_USER)
if [ -z "$USER_HOME" ]; then
    USER_HOME=$HOME
fi

# 로그 디렉토리 생성 및 권한 설정
mkdir -p $USER_HOME/logs/aiga-api-server
chmod 755 $USER_HOME/logs/aiga-api-server

# 환경 변수 설정
export NODE_ENV=development
export LOG_LEVEL=info
export LOG_DIR=$USER_HOME/logs/aiga-api-server

echo "Log directory: $LOG_DIR"

# 날짜별 로그 파일이 자동으로 생성되므로 단일 파일로 리다이렉트할 필요 없음
sudo -E nohup npm run start > /dev/null 2>&1 &