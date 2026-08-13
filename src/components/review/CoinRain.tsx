// [장식용] 페이지가 열릴 때 코인이 위에서 한 번 쏟아지는 인트로 모션
// 순수 장식 요소라 클릭/터치에 반응하지 않음 (pointer-events: none)

const COINS = [
  { left: "3%", size: 26, delay: "0s", duration: "2.2s" },
  { left: "12%", size: 20, delay: "0.15s", duration: "2.6s" },
  { left: "22%", size: 30, delay: "0.05s", duration: "2.1s" },
  { left: "33%", size: 18, delay: "0.3s", duration: "2.8s" },
  { left: "44%", size: 24, delay: "0.1s", duration: "2.3s" },
  { left: "55%", size: 20, delay: "0.35s", duration: "2.5s" },
  { left: "64%", size: 28, delay: "0.2s", duration: "2.2s" },
  { left: "73%", size: 18, delay: "0.4s", duration: "2.7s" },
  { left: "82%", size: 26, delay: "0.05s", duration: "2.4s" },
  { left: "90%", size: 22, delay: "0.25s", duration: "2.6s" },
  { left: "8%", size: 16, delay: "0.5s", duration: "2.3s" },
  { left: "68%", size: 16, delay: "0.45s", duration: "2.1s" },
];

export default function CoinRain() {
  return (
    <div className="coinRainLayer" aria-hidden="true">
      {COINS.map((coin, i) => (
        <span
          key={i}
          className="coinRainItem"
          style={{
            left: coin.left,
            fontSize: coin.size,
            animationDelay: coin.delay,
            animationDuration: coin.duration,
          }}
        >
          🪙
        </span>
      ))}
    </div>
  );
}