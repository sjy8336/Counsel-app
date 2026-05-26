import openai
from app.utils.keyword_extractor import extract_keywords
from app.core.config import settings
import json
import re
import unicodedata

client = openai.OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=settings.OPENAI_API_KEY
)

# 허용된 힐링 아이템 목록
HEALING_ITEMS = {
    "tea": [
        "아이스 아메리카노", "따뜻한 아메리카노",
        "캐모마일 티", "따뜻한 캐모마일 티", "아이스 캐모마일 티",
        "페퍼민트 티", "따뜻한 페퍼민트 티",
        "핫초코", "따뜻한 핫초코",
        "카모마일 라떼", "따뜻한 카모마일 라떼",
        "핫 레몬차", "따뜻한 레몬차",
        "자몽에이드", "탄산수", "히비스커스 티",
        "따뜻한 보이차", "루이보스 티",
    ],
    "home": [
        "다크초콜릿 한 조각", "민트 초콜릿",
        "새콤한 과일 젤리", "따뜻한 군고구마",
        "스트레스 볼", "컬러링북",
    ],
    "walk": ["가벼운 동네 산책"],
    "scent": ["라벤더 룸 스프레이"],
    "music": ["좋아하는 플레이리스트"],
}

# 아이템명 → 아이콘 역방향 매핑
ITEM_TO_ICON = {
    item: icon
    for icon, items in HEALING_ITEMS.items()
    for item in items
}


def validate_healing_item(title: str, icon: str) -> tuple:
    """healing_title이 허용 목록에 없으면 기본값으로 교체, 아이콘도 목록 기준으로 보정"""
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
        from hanspell import spell_checker
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

    # healing_title 허용 목록 검증 및 아이콘 보정
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

    # 허용 목록 문자열 생성
    high_stress_items = "아이스 아메리카노 / 페퍼민트 티 / 탄산수 / 자몽에이드 / 스트레스 볼"
    mid_stress_items  = "캐모마일 티 / 카모마일 라떼 / 다크초콜릿 한 조각 / 루이보스 티"
    low_stress_items  = "따뜻한 핫초코 / 따뜻한 군고구마 / 새콤한 과일 젤리 / 히비스커스 티"

    user_prompt = f"""
닉네임: "{nickname}"
일기: "{diary_text}"
감정: {emotion} / 강도: {intensity}% / 스트레스: {stress}%

아래 JSON 형식으로만 응답하세요. 설명, 분석 과정, 추가 텍스트 없이 JSON만 출력하세요.

{{
    "empathy": "{nickname}님, 으로 시작하는 2문장. 일기에 실제 쓰인 상황을 그대로 반영. 어미는 ~네요, ~겠어요, ~이에요 자연스럽게 혼용. ~것 같아요 금지.",
    "reason": "반드시 이름 없이 2문장. '{nickname}'이라는 단어 절대 금지. 이 일기 상황이 왜 심리적으로 소진을 일으키는지 설명. 비유적 언어 사용. 영어·전문용어 금지.",
    "action": "반드시 이름 없이 2문장. '{nickname}'이라는 단어 절대 금지. healing_title 아이템 하나만 언급. 다른 활동 추가 금지. 왜 지금 이 감정에 이 아이템이 맞는지 설명. ~해요, ~거든요 어미 사용.",
    "healing_title": "아래 목록에서 딱 하나만 선택. 목록 외 창작 절대 금지.\n[스트레스 높음 70%+] {high_stress_items}\n[스트레스 중간 40~69%] {mid_stress_items}\n[스트레스 낮음 ~39%] {low_stress_items}\n현재 스트레스: {stress}%",
    "healing_desc": "2문장. 문장1: '~때문에 선택했어요.' 또는 '~이기 때문이에요.' 형태로 추천 이유 설명. 문장2: '~해줘요.' 또는 '~거든요.' 로 끝나는 구체적인 감각 효과 설명. 두 문장 모두 자연스러운 구어체 한국어로 작성. ~위해서에요 금지. ~진정, 으로 이어지는 나열 금지. 이름 언급 금지.",
    "healing_icon": "healing_title이 음료이면 tea, 음악이면 music, 산책이면 walk, 향이면 scent, 간식이면 home"
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