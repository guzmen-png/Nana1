# 나날

아이폰에 맞춘 날짜별 사진 캘린더. 캘린더에서 하루를 열고 사진을 남기고, 프로젝트 탭으로 날짜를 묶습니다.

## 실행

```bash
npm install
env -u DATABASE_URL npm run dev
```

로컬에서는 PGlite(인메모리)를 쓰고, Cursor에 배포하면 Postgres가 연결됩니다.

## 기능

- 월간 캘린더 + 날짜별 사진 썸네일
- 하루 메모 / 프로젝트 연결
- 프로젝트 탭과 프로젝트별 날짜 타임라인
- 테마 색 변경 (기기에 저장)
- 홈 화면 추가용 PWA 매니페스트
- Capacitor iOS 앱 (카메라·사진 보관함 권한 포함)

## Mac 앱 설치

업로드됨: [`install/nanal-mac-setup.zip`](./install/nanal-mac-setup.zip)

1. zip을 Mac에서 풀기  
2. `나날 Mac 설치하기.command` 더블클릭  
3. 저장소 설치 후 `나날.app` 실행 (사진/카메라 권한 포함)

또는 저장소를 clone 한 뒤 `install/mac/설치하기.command` 를 실행하세요.

## 아이폰 앱 설치 파일

사진 접근 권한이 포함된 Xcode 프로젝트 zip (GitHub에 업로드됨):

```bash
npm run ios:package
# → install/nanal-ios-xcode.zip
```

Mac에서 `ios/App/App.xcodeproj` 를 열고 Signing Team을 선택한 뒤 iPhone에 Run 하면 설치됩니다.

권한 문구(`Info.plist`): 사진 보관함 / 카메라 / 보관함 저장
