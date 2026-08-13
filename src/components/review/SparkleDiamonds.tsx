// [장식용] 페이지 배경에 작은 다이아몬드들이 번갈아 반짝이는 효과
// 순수 장식 요소라 클릭/터치에 반응하지 않음 (pointer-events: none)
// 스크롤과 함께 움직이도록 fixed가 아닌 배경(정적 위치)으로 삽입됨

// 고정된 위치/타이밍 배열 (매번 렌더링될 때마다 값이 바뀌지 않도록 미리 정의)
const DIAMONDS = Array.from({ length: 48 }, (_, i) => {
  // 결정적(deterministic)이지만 흩어진 것처럼 보이는 좌표를 만들기 위한 간단한 규칙
  const left = ((i * 37) % 100) + (i % 3) * 1.5;
  const top = ((i * 53) % 100) + (i % 5) * 0.8;
  const size = 3 + (i % 4); // 3~6px
  const delay = (i % 12) * 0.35; // 0 ~ 4.2s 사이로 분산
  const duration = 2.4 + (i % 5) * 0.4; // 2.4 ~ 4.0s

  return { left, top, size, delay, duration };
});

export default function SparkleDiamonds() {
  return (
    <div className="sparkleLayer" aria-hidden="true">
      {DIAMONDS.map((d, i) => (
        <span
          key={i}
          className="sparkleDiamond"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            fontSize: d.size,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        >
          ◆
        </span>
      ))}
    </div>
  );
}