#!/usr/bin/env bash
# make-local.sh — 미러를 로컬 실행 가능하게 1회 변환 (원본은 .bak 백업)
set -euo pipefail
cd "$(dirname "$0")/../app"

echo "[1/2] package.json 변환..."
cp package.json package.platform.json.bak
python3 - <<'EOF'
import io, json
p = "package.json"
d = json.load(io.open(p, encoding="utf-8"))
d.pop("workspaces", None)
for dep in ["@higgsfield/fnf", "@higgsfield/fnf-react", "@higgsfield/quanta"]:
    d.get("dependencies", {}).pop(dep, None)
io.open(p, "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
print("  - @higgsfield/* 워크스페이스 의존성 제거 완료")
EOF

echo "[2/2] styles.css 변환..."
cp src/styles.css src/styles.platform.css.bak
python3 - <<'EOF'
import io
p = "src/styles.css"
s = io.open(p, encoding="utf-8").read()
s = s.replace('@source "../packages/quanta/src";\n', "")
s = s.replace('@import "@higgsfield/quanta/tailwind.css";\n', "")
io.open(p, "w", encoding="utf-8").write(s)
print("  - 플랫폼 CSS import 제거 완료")
EOF

echo ""
echo "완료. 이제 아래를 실행하세요:"
echo "  cd app && bun install && bun run dev"
