# 나날 아이폰 설치 패키지

- 파일: [`nanal-ios-xcode.zip`](./nanal-ios-xcode.zip)
- 포함: Capacitor iOS Xcode 프로젝트 + **사진/카메라 접근 권한** (`Info.plist`)

## 바로 설치하려면 (Mac 필요)

1. zip 압축 해제
2. `ios/App/App.xcodeproj` 를 Xcode로 열기
3. Signing Team에 Apple ID 선택
4. iPhone 연결 후 Run

앱에서 **+ 사진**을 누르면 iOS가 사진 보관함/카메라 허용 팝업을 띄웁니다.

> 서명된 `.ipa`를 이 환경에서 바로 만들 수는 없습니다. Apple 서명과 Mac/Xcode가 필요합니다. Mac이 없다면 Safari에서 나날 웹을 연 뒤 **공유 → 홈 화면에 추가**로도 사용할 수 있습니다(웹 파일 선택기로 사진 추가).
