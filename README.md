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
- 홈 화면 추가용 PWA 매니페스트
- Capacitor iOS 앱 (카메라·사진 보관함 권한 포함)

## 아이폰 앱 설치 파일

사진 접근 권한이 포함된 Xcode 프로젝트 zip:

```bash
npm run ios:package
# → dist/nanal-ios-xcode.zip
```

Mac에서 `ios/App/App.xcodeproj` 를 열고 Signing Team을 선택한 뒤 iPhone에 Run 하면 설치됩니다. 자세한 내용은 zip 안의 `INSTALL_KR.md` 를 보세요.

권한 문구(`Info.plist`):

- 사진 보관함 / 카메라 / 보관함 저장
