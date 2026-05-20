from konlpy.tag import Okt
from collections import Counter
import re

okt = Okt()

def extract_keywords(text: str, top_n: int = 3) -> list[str]:
    # 1. 특수문자 제거 및 한글만 남기기
    cleaned_text = re.sub(r'[^가-힣\s]', ' ', text)
    
    # 2. 형태소 분석기를 통해 명사(Noun)만 추출
    nouns = okt.nouns(cleaned_text)
    
    # 3. 무의미한 단어(불용어) 필터링 (2글자 이상만 채택)
    meaningful_nouns = [noun for noun in nouns if len(noun) >= 2 and noun not in ['내담', '상담', '진행', '내용', '대해', '보고', '통해']]
    
    # 4. 빈도수 계산 후 상위 N개 추출
    count = Counter(meaningful_nouns)
    top_keywords = [item[0] for item in count.most_common(top_n)]
    
    return top_keywords