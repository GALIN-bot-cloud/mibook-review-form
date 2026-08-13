// [장식용] 페이지가 열릴 때 코인이 위에서 떨어진 뒤, 그 자리에서 계속 둥둥 떠다니는 인트로+지속 모션
// 순수 장식 요소라 클릭/터치에 반응하지 않음 (pointer-events: none)

const COINS = [
  { left: "3%", size: 26, restTop: "62vh", fallDuration: 2.2, fallDelay: 0 },
  { left: "12%", size: 20, restTop: "78vh", fallDuration: 2.6, fallDelay: 0.15 },
  { left: "22%", size: 30, restTop: "55vh", fallDuration: 2.1, fallDelay: 0.05 },
  { left: "33%", size: 18, restTop: "85vh", fallDuration: 2.8, fallDelay: 0.3 },
  { left: "44%", size: 24, restTop: "68vh", fallDuration: 2.3, fallDelay: 0.1 },
  { left: "55%", size: 20, restTop: "80vh", fallDuration: 2.5, fallDelay: 0.35 },
  { left: "64%", size: 28, restTop: "58vh", fallDuration: 2.2, fallDelay: 0.2 },
  { left: "73%", size: 18, restTop: "88vh", fallDuration: 2.7, fallDelay: 0.4 },
  { left: "82%", size: 26, restTop: "65vh", fallDuration: 2.4, fallDelay: 0.05 },
  { left: "90%", size: 22, restTop: "75vh", fallDuration: 2.6, fallDelay: 0.25 },
  { left: "8%", size: 16, restTop: "92vh", fallDuration: 2.3, fallDelay: 0.5 },
  { left: "68%", size: 16, restTop: "50vh", fallDuration: 2.1, fallDelay: 0.45 },
];

export default function CoinRain() {
  return (
    <div className="coinRainLayer" aria-hidden="true">
      {COINS.map((coin, i) => {
        const floatDelay = coin.fallDuration + coin.fallDelay;
        return (
          <div
            key={i}
            className="coinRainItem"
            style={
              {
                left: coin.left,
                fontSize: coin.size,
                animationDuration: `${coin.fallDuration}s`,
                animationDelay: `${coin.fallDelay}s`,
                "--rest-top": coin.restTop,
              } as React.CSSProperties
            }
          >
            <span
              className="coinFloatInner"
              style={{ animationDelay: `${floatDelay}s` }}
            >
              🪙
            </span>
          </div>
        );
      })}
    </div>
  );
}