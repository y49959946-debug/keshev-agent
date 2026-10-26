# 학생 작성: 케셰브 개요

이 문서는 학생이 작성했습니다. 처음에는 `README.md` 맨 아래 절로 덧붙였으나, 시작 틀 0.2.19 업데이트(제공 파일은 원본 그대로여야 함)를 위해 2026-10-26에 내용을 바꾸지 않고 이 파일로 옮겼습니다. `README.md`는 시작 틀 원본으로 되돌렸습니다. 실행 절차·구성도·확인 결과의 전체 내용은 [docs/STUDENT_RUNBOOK.md](STUDENT_RUNBOOK.md)에 있습니다.

- **목적**: 직원(학생) 본인의 로그인·기기·세션, 업무 앱 접근 판정, 접속 기록·XDR 경보, 설치 패키지의 알려진 취약점을 한 화면에서 확인하는 ZTNA·XDR 보안 Agent 「케셰브」입니다.
- **기능**: 학생이 `student/extension.mjs`에 8개 표시 함수를 작성했습니다(13~20단계: `renderIdentity`, `renderDecision`, `renderEvents`, `renderStatus`, `renderAiConnection`, `renderExplanation`, `renderAction`, `renderVulnerabilities`). 서버·화면·연결 코드는 시작 틀이 제공합니다.
- **구성**: 브라우저 → 로컬 앱 서버(`src/server.mjs`, `127.0.0.1:5189`) → 접근 제어·XDR 시스템(SDP 설정이 있을 때) / AI 게이트웨이(계정 연결·앱 승인 뒤) / OSV(조회 대상이 준비됐을 때).
- **지원 환경과 버전**: Windows PowerShell(작성자 PC 5.1.26100.9711), Node.js 22~24(기준 24.19.0, `package.json`의 `engines`, 작성자 PC v24.19.0), 외부 npm 패키지 없음, 시작 틀 `alekov-client-starter` 0.2.11.
- **실행**: 앱 폴더(`on-client`)에서 `powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1` → 브라우저 `http://127.0.0.1:5189/`.
- **확인 범위**: 기본 실행(연결 없음)과 예제 모드(`-Demo`)는 화면에서 확인했습니다. 실제 SDP·계정·AI·조치·OSV 연결은 설정이 준비되지 않아 확인하지 못했습니다.
- **릴리스·재현 기록**: 새 폴더 재현 결과, 13~21단계 결과표, 데이터 보존 계획, 지원 범위와 미해결 사항은 [docs/RELEASE_RECORD.md](RELEASE_RECORD.md)에 있습니다. 현재 버전은 실제 연결이 남아 있는 검증 중인 버전입니다.
