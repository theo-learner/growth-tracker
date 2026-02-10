/**
 * K-DST (한국형 영유아 발달 선별검사) 핵심 질문 데이터베이스
 * 24개월 ~ 71개월 구간 (만 2세 ~ 만 5세)
 * 출처: 질병관리청 국가건강정보포털
 */

export interface KDSTChecklist {
  range: string; // "24 ~ 26개월"
  minMonth: number;
  maxMonth: number;
  tasks: {
    domain: string; // 대근육, 소근육, 인지, 언어, 사회성, 자조
    question: string;
  }[];
}

export const KDST_DATA: KDSTChecklist[] = [
  {
    range: "24 ~ 26개월",
    minMonth: 24,
    maxMonth: 26,
    tasks: [
      { domain: "대근육", question: "제자리에서 두 발을 모아 껑충 뛴다." },
      { domain: "소근육", question: "블록을 6개 이상 위로 쌓는다." },
      { domain: "언어", question: "두 단어 문장(예: '엄마 까까')을 말한다." },
      { domain: "사회성", question: "부모의 행동(청소, 전화 등)을 흉내낸다." },
      { domain: "자조", question: "숟가락을 사용하여 혼자 밥을 먹는다." },
    ],
  },
  {
    range: "27 ~ 29개월",
    minMonth: 27,
    maxMonth: 29,
    tasks: [
      { domain: "대근육", question: "한 발로 1초 이상 서 있는다." },
      { domain: "소근육", question: "책장을 한 장씩 넘긴다." },
      { domain: "언어", question: "'나', '너' 등의 대명사를 사용한다." },
      { domain: "자조", question: "혼자서 바지를 내린다." },
    ],
  },
  {
    range: "30 ~ 32개월",
    minMonth: 30,
    maxMonth: 32,
    tasks: [
      { domain: "대근육", question: "계단을 한 발씩 번갈아 올라간다." },
      { domain: "소근육", question: "가위로 종이를 자르는 시늉을 한다." },
      { domain: "인지", question: "크기(크다/작다)를 구분한다." },
      { domain: "언어", question: "이름과 나이를 물으면 대답한다." },
    ],
  },
  {
    range: "33 ~ 35개월",
    minMonth: 33,
    maxMonth: 35,
    tasks: [
      { domain: "대근육", question: "세발자전거의 페달을 밟아서 앞으로 나간다." },
      { domain: "소근육", question: "원을 보고 비슷하게 그린다." },
      { domain: "언어", question: "3개 이상의 단어로 된 문장을 말한다." },
      { domain: "사회성", question: "친구들과 순서를 지키며 놀이한다." },
    ],
  },
  {
    range: "36 ~ 41개월",
    minMonth: 36,
    maxMonth: 41,
    tasks: [
      { domain: "대근육", question: "한 발로 3초 이상 서 있는다." },
      { domain: "소근육", question: "가위로 선을 따라 종이를 자른다." },
      { domain: "인지", question: "숫자 3까지 셀 수 있다." },
      { domain: "언어", question: "'왜'라는 질문을 사용하여 묻는다." },
    ],
  },
  {
    range: "42 ~ 47개월",
    minMonth: 42,
    maxMonth: 47,
    tasks: [
      { domain: "대근육", question: "한 발로 깡충깡충 뛴다." },
      { domain: "소근육", question: "사람을 그릴 때 머리, 몸통 등 3부분 이상을 그린다." },
      { domain: "언어", question: "과거와 미래 시제를 사용하여 말한다." },
      { domain: "자조", question: "단추를 혼자서 채운다." },
    ],
  },
  {
    range: "48 ~ 53개월",
    minMonth: 48,
    maxMonth: 53,
    tasks: [
      { domain: "대근육", question: "그네를 혼자서 탄다." },
      { domain: "소근육", question: "네모를 보고 비슷하게 그린다." },
      { domain: "인지", question: "색깔 이름을 4가지 이상 말한다." },
      { domain: "사회성", question: "규칙이 있는 게임을 이해하고 참여한다." },
    ],
  },
  {
    range: "54 ~ 59개월",
    minMonth: 54,
    maxMonth: 59,
    tasks: [
      { domain: "대근육", question: "줄넘기를 흉내 낸다." },
      { domain: "소근육", question: "가위로 별 모양 등 복잡한 모양을 오린다." },
      { domain: "언어", question: "자신의 집 주소나 전화번호를 말한다." },
      { domain: "자조", question: "용변 후 혼자 뒤처리를 한다." },
    ],
  },
  {
    range: "60 ~ 71개월",
    minMonth: 60,
    maxMonth: 71,
    tasks: [
      { domain: "대근육", question: "발을 번갈아 가며 줄넘기를 한다." },
      { domain: "소근육", question: "이름을 쓴다." },
      { domain: "인지", question: "요일의 순서를 안다." },
      { domain: "사회성", question: "친한 친구를 선택하고 우정을 나눈다." },
    ],
  },
];

// 월령 계산 유틸리티
export function calculateMonths(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const now = new Date();
  
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months -= birth.getMonth();
  months += now.getMonth();
  
  // 일자 보정 (30.4일 기준)
  const days = now.getDate() - birth.getDate();
  if (days < 0) months -= 1;
  
  return Math.max(0, months);
}

// 해당 월령의 K-DST 체크리스트 찾기
export function getKDSTChecklist(months: number): KDSTChecklist | null {
  return KDST_DATA.find((k) => months >= k.minMonth && months <= k.maxMonth) || null;
}
