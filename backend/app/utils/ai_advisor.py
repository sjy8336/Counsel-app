import openai
from app.utils.keyword_extractor import extract_keywords
from app.core.config import settings
import json
import re
import unicodedata
from hanspell import spell_checker

client = openai.OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=settings.OPENAI_API_KEY
)

# 허용된 힐링 아이템 목록
HEALING_ITEMS = {
    "tea": [
        # 커피류
        "아이스 아메리카노", "따뜻한 아메리카노", "아이스 라떼", "따뜻한 라떼",
        "콜드브루", "바닐라 라떼", "카라멜 마키아토", "에스프레소 샷",
        "아이스 돌체 라떼", "플랫화이트",
        # 티류
        "캐모마일 티", "따뜻한 캐모마일 티", "아이스 캐모마일 티",
        "페퍼민트 티", "따뜻한 페퍼민트 티", "아이스 페퍼민트 티",
        "히비스커스 티", "루이보스 티", "따뜻한 보이차",
        "핫 레몬차", "따뜻한 레몬차", "생강차", "유자차",
        "카모마일 라떼", "따뜻한 카모마일 라떼", "얼그레이 티",
        "홍차 라떼", "재스민 티", "녹차 라떼", "말차 라떼",
        "로즈힙 티", "애플 시나몬 티",
        # 음료류
        "핫초코", "따뜻한 핫초코", "아이스 핫초코",
        "자몽에이드", "레몬에이드", "청포도에이드", "딸기에이드",
        "탄산수", "토닉워터", "딸기 스무디", "망고 스무디",
        "따뜻한 두유", "오트밀 라떼", "아몬드 라떼",
        "복숭아 아이스티", "패션후르츠 에이드",
    ],
    "home": [
        # 초콜릿류
        "다크초콜릿 한 조각", "밀크초콜릿", "민트 초콜릿",
        "화이트초콜릿", "초콜릿 트러플",
        # 베이커리·과자류
        "마카롱", "쿠키 한 봉지", "감자칩", "크루아상",
        "버터 쿠키", "브라우니 한 조각", "카스텔라",
        "눈꽃 빙수", "소프트 아이스크림",
        # 과일·건강 간식
        "새콤한 과일 젤리", "따뜻한 군고구마", "군밤",
        "망고 젤리", "하리보 젤리", "말린 과일 믹스",
        "바나나 한 개", "방울토마토 한 줌", "견과류 한 줌",
        "그래놀라 바", "요거트 한 컵",
        # 감각 도구
        "스트레스 볼", "컬러링북", "피젯 큐브",
        "핫팩", "쿨패치", "아이스 안대",
        "향기 나는 손 크림", "립밤", "따뜻한 수건 찜질",
        "마사지 볼", "손가락 지압링",
    ],
    "walk": [
        "가벼운 동네 산책",
        "10분 스트레칭",
        "베란다 바람 쐬기",
        "계단 오르내리기",
        "잠깐 햇빛 쬐기",
        "공원 벤치에 앉아 멍 때리기",
    ],
    "scent": [
        "라벤더 룸 스프레이",
        "유칼립투스 디퓨저",
        "시트러스 향 핸드워시",
        "좋아하는 향수 한 번 뿌리기",
        "페퍼민트 에센셜 오일 한 방울",
        "로즈 향 바디로션",
        "샌달우드 인센스 스틱",
    ],
    "music": [
        "좋아하는 플레이리스트",
        "빗소리 백색소음",
        "재즈 카페 음악",
        "잔잔한 피아노 연주곡",
        "파도 소리 자연음",
        "Lo-Fi 힙합 음악",
        "클래식 현악 4중주",
        "좋아하는 노래 한 곡 크게 틀기",
    ],
}

# 아이템명 → 아이콘 역방향 매핑
ITEM_TO_ICON = {
    item: icon
    for icon, items in HEALING_ITEMS.items()
    for item in items
}


def validate_healing_item(title: str, icon: str) -> tuple:
    if title in ITEM_TO_ICON:
        return title, ITEM_TO_ICON[title]
    return "따뜻한 캐모마일 티", "tea"


def clean_korean_only(text: str) -> str:
    allowed_chars = set(' \n.,!?%~()[]"\'…·—–')
    result = []
    i = 0
    while i < len(text):
        char = text[i]
        if '\uAC00' <= char <= '\uD7A3':
            result.append(char)
        elif '\u3131' <= char <= '\u318E':
            result.append(char)
        elif char.isdigit():
            result.append(char)
        elif char in allowed_chars:
            result.append(char)
        else:
            prev_is_korean = bool(result) and '\uAC00' <= result[-1] <= '\uD7A3'
            next_char = text[i + 1] if i + 1 < len(text) else ''
            next_is_korean = '\uAC00' <= next_char <= '\uD7A3'
            if prev_is_korean and next_is_korean:
                pass
            else:
                pass
        i += 1

    cleaned = ''.join(result)
    cleaned = re.sub(r' +([.,!?…])', r'\1', cleaned)
    cleaned = re.sub(r' {2,}', ' ', cleaned)
    return cleaned.strip()


def fix_common_typos(text: str, nickname: str = "") -> str:
    try:
        sentences = text.split('\n\n')
        corrected = []
        for sentence in sentences:
            if sentence.strip():
                result = spell_checker.check(sentence)
                corrected.append(result.checked)
            else:
                corrected.append(sentence)
        text = '\n\n'.join(corrected)
    except Exception:
        corrections = {
            r'되요': '돼요',
            r'되었어요': '됐어요',
            r'되었네요': '됐네요',
            r'되어요': '돼요',
            r'되어서': '돼서',
            r'되어': '돼',
            r'안되니까': '안 되니까',
            r'안되서': '안 돼서',
            r'안되고': '안 되고',
            r'안돼니까': '안 되니까',
            r'돼니까': '되니까',
            r'제대로 안 돼니까': '제대로 안 되니까',
            r'안 돼니까': '안 되니까',
            r'수 밖에': '수밖에',
            r'할 수있': '할 수 있',
            r'위해서에요': '위해서예요',
            r'위해서 에요': '위해서예요',
            r'이기 때문에요': '이기 때문이에요',
            r'진정,\s*스트레스': '진정되고 스트레스',
            r'완화,\s*': '완화되고 ',
            r'감소,\s*': '감소하고 ',
            r'\s+([.,!?…])': r'\1',
        }
        for pattern, replacement in corrections.items():
            text = re.sub(pattern, replacement, text)

    if nickname:
        text = re.sub(rf'{re.escape(nickname)}님[,\s]*(께서|은|는|이|가|의|에게)?', '', text)
        text = re.sub(r' {2,}', ' ', text).strip()

    return text


def sanitize_ai_response(ai_response: dict, nickname: str = "") -> dict:
    text_fields = ['empathy', 'reason', 'action', 'healing_title', 'healing_desc']
    for field in text_fields:
        if field in ai_response:
            cleaned = clean_korean_only(ai_response[field])
            ai_response[field] = fix_common_typos(
                cleaned,
                nickname if field != 'empathy' else ""
            )

    title = ai_response.get("healing_title", "")
    icon = ai_response.get("healing_icon", "tea")
    ai_response["healing_title"], ai_response["healing_icon"] = validate_healing_item(title, icon)

    return ai_response


def generate_ai_report(diary_text: str, emotion: str, intensity: int, stress: int, nickname: str):
    auto_keywords = extract_keywords(diary_text, top_n=2)

    system_instruction = """당신은 따뜻하고 통찰력 있는 한국어 심리상담사입니다.
반드시 지켜야 할 규칙:
1. 출력은 JSON만. JSON 바깥에 어떤 텍스트도 절대 쓰지 마세요. 분석 과정도 출력하지 마세요.
2. 모든 필드는 완전한 한글만 사용. 영어 단어, 로마자, 한자 절대 금지.
3. 일기에 실제 쓰인 내용만 반영하세요. 일기에 없는 상황을 추측해서 추가하지 마세요."""

    # 스트레스·감정 기반 선택 힌트
    emotion_hint = {
        "happy":  "행복한 감정이므로 달콤하거나 향긋한 아이템 선호",
        "calm":   "평온한 감정이므로 따뜻하고 부드러운 아이템 선호",
        "tired":  "피로한 감정이므로 각성 효과나 따뜻한 위로가 되는 아이템 선호",
        "sad":    "우울한 감정이므로 달콤하거나 포근한 아이템 선호",
        "angry":  "화난 감정이므로 차갑고 시원한 자극 또는 손을 바쁘게 하는 아이템 선호",
    }.get(emotion, "")

    # 전체 허용 목록을 카테고리별로 프롬프트에 주입
    all_items_str = "\n".join(
        f"[{icon}] " + " / ".join(items)
        for icon, items in HEALING_ITEMS.items()
    )

    high_stress_items = (
        "아이스 아메리카노 / 콜드브루 / 에스프레소 샷 / 아이스 페퍼민트 티 / "
        "탄산수 / 자몽에이드 / 딸기에이드 / 패션후르츠 에이드 / "
        "쿨패치 / 아이스 안대 / 스트레스 볼 / 피젯 큐브 / 마사지 볼 / 손가락 지압링 / "
        "감자칩 / 민트 초콜릿 / 하리보 젤리 / "
        "빗소리 백색소음 / 좋아하는 노래 한 곡 크게 틀기 / "
        "페퍼민트 에센셜 오일 한 방울 / 계단 오르내리기"
    )
    mid_stress_items = (
        "아이스 라떼 / 바닐라 라떼 / 오트밀 라떼 / 아몬드 라떼 / 말차 라떼 / "
        "캐모마일 티 / 루이보스 티 / 얼그레이 티 / 재스민 티 / 홍차 라떼 / "
        "복숭아 아이스티 / 딸기 스무디 / 망고 스무디 / "
        "다크초콜릿 한 조각 / 마카롱 / 브라우니 한 조각 / 버터 쿠키 / "
        "망고 젤리 / 그래놀라 바 / 요거트 한 컵 / "
        "라벤더 룸 스프레이 / 유칼립투스 디퓨저 / 로즈 향 바디로션 / "
        "좋아하는 플레이리스트 / Lo-Fi 힙합 음악 / 재즈 카페 음악 / "
        "10분 스트레칭 / 가벼운 동네 산책 / 잠깐 햇빛 쬐기"
    )
    low_stress_items = (
        "따뜻한 핫초코 / 따뜻한 두유 / 따뜻한 라떼 / 따뜻한 카모마일 라떼 / "
        "핫 레몬차 / 유자차 / 생강차 / 애플 시나몬 티 / 로즈힙 티 / "
        "따뜻한 군고구마 / 군밤 / 카스텔라 / 크루아상 / 소프트 아이스크림 / "
        "바나나 한 개 / 방울토마토 한 줌 / 견과류 한 줌 / 말린 과일 믹스 / "
        "핫팩 / 따뜻한 수건 찜질 / 향기 나는 손 크림 / 립밤 / "
        "샌달우드 인센스 스틱 / 좋아하는 향수 한 번 뿌리기 / "
        "잔잔한 피아노 연주곡 / 클래식 현악 4중주 / 파도 소리 자연음 / "
        "컬러링북 / 공원 벤치에 앉아 멍 때리기 / 베란다 바람 쐬기"
    )

    user_prompt = f"""
닉네임: "{nickname}"
일기: "{diary_text}"
감정: {emotion} / 강도: {intensity}% / 스트레스: {stress}%

아래 JSON 형식으로만 응답하세요. 설명, 분석 과정, 추가 텍스트 없이 JSON만 출력하세요.

{{
    "empathy": "{nickname}님, 으로 시작하는 2문장. 일기에 실제 쓰인 상황을 그대로 반영. 어미는 ~네요, ~겠어요, ~이에요 자연스럽게 혼용. ~것 같아요 금지.",
    "reason": "반드시 이름 없이 2문장. '{nickname}'이라는 단어 절대 금지. 이 일기 상황이 왜 심리적으로 소진을 일으키는지 설명. 비유적 언어 사용. 영어·전문용어 금지.",
    "action": "반드시 이름 없이 2문장. '{nickname}'이라는 단어 절대 금지. healing_title 아이템 하나만 언급. 다른 활동 추가 금지. 왜 지금 이 감정에 이 아이템이 맞는지 설명. ~해요, ~거든요 어미 사용.",
    "healing_title": "아래 목록에서 딱 하나만 선택. 목록 외 창작 절대 금지. 매번 다양하게 선택할 것. 티·커피만 반복 금지.\n현재 스트레스: {stress}% / 감정: {emotion} / {emotion_hint}\n[스트레스 높음 70%+] {high_stress_items}\n[스트레스 중간 40~69%] {mid_stress_items}\n[스트레스 낮음 ~39%] {low_stress_items}",
    "healing_desc": ""2문장. 이름 언급 금지. ~것 같아요·~마음을 편안하게 금지.
    문장1: 일기 내용({diary_text[:20]}...)에서 느껴지는 감정 상태를 한 단어로 짚고, 이 아이템의 핵심 성분이나 특성이 그 상태에 왜 맞는지 연결해서 설명. '~에 도움이 돼요.' 또는 '~효과가 있어요.' 로 끝낼 것.
    문장2: 실제로 사용할 때 느껴지는 감각(온도·향·맛·촉감 중 하나)을 짧고 생생하게. '~거든요.' 또는 '~해줘요.' 로 끝낼 것.
    두 문장 합쳐서 70자 이내."",
    "healing_icon": "healing_title이 음료이면 tea, 음악·소리이면 music, 산책·스트레칭·야외활동이면 walk, 향·스프레이·디퓨저이면 scent, 간식·도구·기타이면 home"
}}

작성 기준:
- empathy: 일기의 구체적 상황({diary_text[:30]}...)을 직접 언급
- reason: 스트레스 {stress}%와 강도 {intensity}%의 의미를 자연스럽게 연결
- healing 계열: healing_title 하나로 action·healing_desc·healing_icon 모두 일치
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7
        )

        raw_content = response.choices[0].message.content.strip()

        json_match = re.search(r'\{.*\}', raw_content, re.DOTALL)
        if json_match:
            ai_response = json.loads(json_match.group(0))
        else:
            ai_response = json.loads(raw_content)

        ai_response = sanitize_ai_response(ai_response, nickname)

        ai_analysis = "\n\n".join([
            ai_response.get("empathy", "").strip(),
            ai_response.get("reason", "").strip(),
            ai_response.get("action", "").strip()
        ]).strip()

        return (
            ai_analysis,
            ai_response.get("healing_title"),
            ai_response.get("healing_desc"),
            ai_response.get("healing_icon", "tea"),
            auto_keywords
        )

    except Exception as e:
        import traceback
        print("\n❌ ====== Groq AI 연동 에러 상세 로그 ======")
        print(f"에러 메시지: {e}")
        traceback.print_exc()
        print("==========================================\n")

        error_fallback = "현재 AI 서버에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
        return error_fallback, "새로운 휴식", "안정을 취하는 것을 권장합니다.", "tea", auto_keywords