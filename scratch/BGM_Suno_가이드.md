# 🎵 BGM 7개 Suno 생성 가이드

> **작성일**: 2025-12-24
> **목적**: autoshort.site/bgm/ 에 업로드할 7개 BGM 생성

---

## 📋 생성할 BGM 목록

| # | 카테고리 | 파일명 | 분위기 |
|---|----------|--------|--------|
| 1 | 건강 | `health_calm.mp3` | 차분, 신뢰감, 힐링 |
| 2 | 재테크 | `finance_upbeat.mp3` | 경쾌, 희망적, 성공 |
| 3 | 운동 | `exercise_energetic.mp3` | 에너제틱, 동기부여 |
| 4 | 음식 | `food_cozy.mp3` | 따뜻, 편안, 아늑 |
| 5 | 노후 | `lifestyle_peaceful.mp3` | 평화로움, 여유 |
| 6 | 국뽕 | `korea_pride.mp3` | 웅장, 자부심, 감동 |
| 7 | 기본 | `default_warm.mp3` | 따뜻, 중립, 범용 |

---

## 🎹 Suno 프롬프트 (복사해서 사용)

### 1️⃣ 건강 (health_calm.mp3)
```
Calm instrumental background music for health and wellness content. 
Soft piano with gentle strings, peaceful and trustworthy atmosphere.
No vocals. 60 seconds. Suitable for senior audience.
Slow tempo, 70-80 BPM. Warm and healing mood.
```

### 2️⃣ 재테크 (finance_upbeat.mp3)
```
Upbeat instrumental background music for finance and investment content.
Light electronic with acoustic guitar, hopeful and successful atmosphere.
No vocals. 60 seconds. Suitable for senior audience.
Medium tempo, 100-110 BPM. Optimistic and motivating mood.
```

### 3️⃣ 운동 (exercise_energetic.mp3)
```
Energetic instrumental background music for exercise and fitness content.
Uplifting electronic with dynamic drums, motivating atmosphere.
No vocals. 60 seconds. Suitable for senior audience.
Medium-fast tempo, 120-130 BPM. Energizing but not aggressive.
```

### 4️⃣ 음식 (food_cozy.mp3)
```
Cozy instrumental background music for food and cooking content.
Warm acoustic guitar with soft percussion, comfortable and inviting atmosphere.
No vocals. 60 seconds. Suitable for senior audience.
Relaxed tempo, 80-90 BPM. Homey and appetizing mood.
```

### 5️⃣ 노후 (lifestyle_peaceful.mp3)
```
Peaceful instrumental background music for lifestyle and retirement content.
Gentle piano with ambient pads, serene and relaxed atmosphere.
No vocals. 60 seconds. Suitable for senior audience.
Slow tempo, 60-70 BPM. Tranquil and contemplative mood.
```

### 6️⃣ 국뽕 (korea_pride.mp3)
```
Epic instrumental background music for Korean pride content.
Majestic orchestral with Korean traditional elements, proud and emotional atmosphere.
No vocals. 60 seconds. Suitable for senior audience.
Medium tempo, 90-100 BPM. Patriotic and inspiring mood.
Blend of traditional Korean instruments (gayageum, daegeum hints) with modern orchestra.
```

### 7️⃣ 기본 (default_warm.mp3)
```
Warm neutral instrumental background music for general content.
Soft piano with light strings, friendly and versatile atmosphere.
No vocals. 60 seconds. Suitable for senior audience.
Moderate tempo, 85-95 BPM. Pleasant and unobtrusive mood.
Works well with any topic.
```

---

## 📝 Suno 사용 가이드

### 1️⃣ Suno 접속
- https://suno.com 접속
- 로그인

### 2️⃣ 음악 생성
1. **Create** 버튼 클릭
2. **Custom Mode** 선택 (프롬프트 직접 입력)
3. 위 프롬프트 복사 → 붙여넣기
4. **Generate** 클릭
5. 2개 결과 중 더 적합한 것 선택

### 3️⃣ 다운로드
1. 생성된 음악 클릭
2. **Download** → **MP3** 선택
3. 파일명을 정확히 변경: `health_calm.mp3` 등

---

## 📤 서버 업로드 가이드

### 방법 1: FileZilla (권장)
```
1️⃣ FileZilla 열기
2️⃣ 서버 접속:
   - 호스트: autoshort.site (또는 LightNode IP)
   - 사용자: root
   - 비밀번호: [서버 비밀번호]
   - 포트: 22
3️⃣ 원격 경로로 이동: /var/www/bgm/
4️⃣ 7개 mp3 파일 드래그&드롭
5️⃣ 업로드 완료 확인
```

### 방법 2: SCP 명령어
```bash
scp health_calm.mp3 finance_upbeat.mp3 exercise_energetic.mp3 food_cozy.mp3 lifestyle_peaceful.mp3 korea_pride.mp3 default_warm.mp3 root@autoshort.site:/var/www/bgm/
```

### 서버 폴더 생성 (처음 한 번만)
```bash
ssh root@autoshort.site
mkdir -p /var/www/bgm
chmod 755 /var/www/bgm
```

### nginx 설정 확인 (처음 한 번만)
`/etc/nginx/sites-available/default` 또는 설정 파일에 추가:
```nginx
location /bgm/ {
    alias /var/www/bgm/;
    add_header Access-Control-Allow-Origin *;
}
```
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ 업로드 확인

모든 업로드 후 아래 URL 접속해서 확인:
- https://autoshort.site/bgm/health_calm.mp3
- https://autoshort.site/bgm/finance_upbeat.mp3
- https://autoshort.site/bgm/exercise_energetic.mp3
- https://autoshort.site/bgm/food_cozy.mp3
- https://autoshort.site/bgm/lifestyle_peaceful.mp3
- https://autoshort.site/bgm/korea_pride.mp3
- https://autoshort.site/bgm/default_warm.mp3

각 URL에서 음악이 재생되면 성공! 🎉

---

## ⏭️ 완료 후 다음 단계

1. ✅ BGM 7개 업로드 완료
2. ➡️ n8n 노드 적용 (Code, GPT, Kling)
3. ➡️ 전체 워크플로우 테스트
4. ➡️ 최종 영상 확인
