---
name: deploy
description: 빌드 후 커밋하고 Vercel에 배포
disable-model-invocation: true
---

배포를 진행합니다. 아래 순서를 따라주세요.

1. `npm run build`로 빌드합니다. 실패하면 에러를 수정하고 다시 빌드합니다.
2. `git status`와 `git diff --stat`으로 변경 파일을 확인합니다.
3. 변경된 파일만 `git add`로 스테이징합니다. (.env, credentials 등 민감 파일은 제외)
4. 변경 내용을 분석하여 간결한 한글 커밋 메시지를 작성합니다. 커밋 메시지는 HEREDOC 형식으로 작성합니다.
5. `git push origin main`으로 배포합니다.
6. 완료 후 배포 URL(https://navi-bible.vercel.app/)을 안내합니다.

주의사항:

- 빌드 실패 시 배포하지 않습니다.
- 변경 사항이 없으면 배포하지 않습니다.
