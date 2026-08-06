#!/bin/bash
# 더블클릭으로 실행 → 로컬 서버로 채용 이미지 툴을 엽니다.
# file:// 로 열면 브라우저 보안 정책 때문에 이미지 추출이 실패합니다.

cd "$(dirname "$0")" || exit 1
PORT=8765
URL="http://127.0.0.1:${PORT}/"

echo "============================================"
echo "  career 채용 공고 이미지 생성 툴"
echo "============================================"
echo ""
echo "로컬 서버를 시작합니다: ${URL}"
echo "이 창을 닫으면 서버가 종료됩니다."
echo ""

# 이미 포트가 사용 중이면 브라우저만 연다
if lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "이미 ${PORT} 포트에서 서버가 실행 중입니다. 브라우저를 엽니다."
  open "${URL}"
  read -r -p "엔터를 누르면 종료합니다..."
  exit 0
fi

open "${URL}"
python3 -m http.server "${PORT}"
