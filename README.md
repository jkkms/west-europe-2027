# 서유럽 2027 여행 페이지 배포 안내

`app.html`은 서버나 데이터베이스 없이 동작하는 단일 정적 웹페이지입니다.

## 가장 쉬운 공유 방법: GitHub Pages

1. GitHub에서 새 **Public** 저장소를 만듭니다. 예: `west-europe-2027`
2. 이 폴더의 `app.html`을 저장소 최상위에 올린 뒤 이름을 `index.html`로 바꿉니다.
3. 저장소의 **Settings → Pages**에서 `Deploy from a branch`와 `main / (root)`를 선택해 저장합니다.
4. 잠시 뒤 표시되는 `https://사용자이름.github.io/west-europe-2027/` 주소를 공유합니다.

## 사진과 링크를 추가하는 법

배포된 페이지에서 하단 **사진·링크** 탭을 엽니다.

- **사진 추가**: 제목, 누구나 열 수 있는 이미지 URL, 선택적 관련 링크를 입력합니다.
- **링크 추가**: 예약·지도·맛집 등의 이름과 URL을 입력합니다.
- **공유 링크 만들기**: 현재 추가한 항목까지 포함한 긴 주소를 복사합니다. 이 주소를 받은 사람은 같은 사진과 링크를 봅니다.
- **백업 내보내기 / 불러오기**: 개인 편집 데이터를 JSON 파일로 보관하거나 다른 기기에서 복원합니다.

중요: 사진 파일을 컴퓨터에서 직접 고르는 방식은 다른 사람이 볼 수 없습니다. 사진은 Google Photos 공유 앨범, iCloud 공유 앨범, Imgur 등에서 **공개 이미지 URL**을 만든 뒤 넣어야 합니다.

## Git으로 올리기 (선택)

저장소를 만든 뒤 이 폴더에서 실행합니다.

```sh
git init
git add app.html README.md
git commit -m "Publish West Europe 2027 travel plan"
git branch -M main
git remote add origin https://github.com/사용자이름/west-europe-2027.git
git push -u origin main
```

그 다음 위 GitHub Pages 단계를 진행하면 됩니다.
