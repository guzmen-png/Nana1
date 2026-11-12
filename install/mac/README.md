# 나날 Mac 설치

GitHub에 **이미 업로드**되어 있습니다. Mac에서 아래 순서로 설치하세요.

## 1) 저장소 받기

```bash
git clone -b cursor/nanal-calendar-app-738d https://github.com/guzmen-png/Nana1.git
cd Nana1
```

또는 GitHub PR/브랜치에서 ZIP 다운로드 후 압축 해제.

## 2) 설치 실행

Finder에서:

`install/mac/설치하기.command`

를 **더블클릭**하세요.  
(처음이면 “확인” / 우클릭 → 열기)

설치가 끝나면 `나날.app`이 실행되고, 가능하면 `~/Applications/나날.app`으로도 복사됩니다.

## 포함 권한

Mac 앱 `Info.plist`에 다음이 들어 있습니다.

- 카메라 접근
- 사진 보관함 접근

## 참고

- Node.js LTS가 필요합니다.
- 미서명 앱이라 첫 실행 시 **우클릭 → 열기**가 필요할 수 있습니다.
- iPhone용 Xcode 패키지는 따로 `install/nanal-ios-xcode.zip` 에 있습니다.
