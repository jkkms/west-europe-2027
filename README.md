# 서유럽 2027 여행 페이지 배포 안내

`app.html`은 서버나 데이터베이스 없이 동작하는 단일 정적 웹페이지입니다. `index.html`은 GitHub Pages 시작 주소를 `app.html`로 연결합니다.

## 가장 쉬운 공유 방법: GitHub Pages

1. GitHub에서 새 **Public** 저장소를 만듭니다. 예: `west-europe-2027`
2. 이 폴더의 `app.html`을 저장소 최상위에 올린 뒤 이름을 `index.html`로 바꿉니다.
3. 저장소의 **Settings → Pages**에서 `Deploy from a branch`와 `main / (root)`를 선택해 저장합니다.
4. 잠시 뒤 표시되는 `https://사용자이름.github.io/west-europe-2027/` 주소를 공유합니다.

## 장소·항공편 자료를 추가하는 법

배포된 페이지에서 해당 도시 카드를 열거나 항공편 카드를 확인한 뒤, **나의 자료 → 링크·사진**을 누릅니다.

- 도시별 입장권·맛집·지도·사진, 출국·귀국 항공편별 좌석도·예약 페이지를 그 위치에 바로 붙일 수 있습니다.
- 표시 방식을 **링크** 또는 **사진**으로 고릅니다.
- 자료는 현재 기기에 저장됩니다.

중요: 사진 파일을 컴퓨터에서 직접 고르는 방식은 다른 사람이 볼 수 없습니다. 사진은 Google Photos 공유 앨범, iCloud 공유 앨범, Imgur 등에서 **공개 이미지 URL**을 만든 뒤 넣어야 합니다. 모든 사람이 체크 상태·자료를 즉시 같이 보려면 Firebase 또는 Supabase 같은 공동 데이터 저장소를 연결해야 합니다.

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
