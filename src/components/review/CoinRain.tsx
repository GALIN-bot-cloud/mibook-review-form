// [장식용] 페이지가 열릴 때 색종이(폭죽) 조각이 위에서 한 번 쏟아지고 사라지는 인트로 모션
// 순수 장식 요소라 클릭/터치에 반응하지 않음 (pointer-events: none)

const COLORS = ["#ff7c3a", "#ffa640", "#ffff64", "#ffffff", "#ff9f6b"];

const CONFETTI = [
  { left: "3%", size: 10, rotate: 20, color: 0, delay: "0s", duration: "2.4s" },
  { left: "12%", size: 8, rotate: 120, color: 1, delay: "0.15s", duration: "2.7s" },
  { left: "22%", size: 12, rotate: 60, color: 2, delay: "0.05s", duration: "2.2s" },
  { left: "33%", size: 7, rotate: 200, color: 3, delay: "0.3s", duration: "2.9s" },
  { left: "44%", size: 10, rotate: 90, color: 4, delay: "0.1s", duration: "2.4s" },
  { left: "55%", size: 8, rotate: 150, color: 0, delay: "0.35s", duration: "2.6s" },
  { left: "64%", size: 11, rotate: 30, color: 2, delay: "0.2s", duration: "2.3s" },
  { left: "73%", size: 7, rotate: 260, color: 1, delay: "0.4s", duration: "2.8s" },
  { left: "82%", size: 10, rotate: 80, color: 4, delay: "0.05s", duration: "2.5s" },
  { left: "90%", size: 9, rotate: 180, color: 3, delay: "0.25s", duration: "2.7s" },
  { left: "8%", size: 7, rotate: 45, color: 2, delay: "0.5s", duration: "2.4s" },
  { left: "68%", size: 8, rotate: 300, color: 0, delay: "0.45s", duration: "2.2s" },
  { left: "18%", size: 9, rotate: 110, color: 4, delay: "0.6s", duration: "2.6s" },
  { left: "58%", size: 7, rotate: 220, color: 1, delay: "0.55s", duration: "2.9s" },
];

export default function CoinRain() {
  return (
    <div className="coinRainLayer" aria-hidden="true">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="confettiItem"
          style={
            {
              left: c.left,
              animationDelay: c.delay,
              animationDuration: c.duration,
              "--rotate-from": `${c.rotate}deg`,
              "--rotate-to": `${c.rotate + 360}deg`,
            } as React.CSSProperties
          }
        >
          <span
            className="confettiPiece"
            style={{ width: c.size, height: c.size * 1.6, background: COLORS[c.color] }}
          />
        </span>
      ))}
    </div>
  );
}