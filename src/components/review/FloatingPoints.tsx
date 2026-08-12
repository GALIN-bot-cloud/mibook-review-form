// [장식용] 배경에 떠다니는 포인트 아이콘들
// 순수하게 시각적인 장식 요소라 클릭/터치에 반응하지 않음 (pointer-events: none)

const CHIPS = [
  { label: "+2,000P", top: "8%", left: "4%", size: 13, delay: "0s", duration: "10s" },
  { label: "🎁", top: "18%", left: "88%", size: 20, delay: "1.2s", duration: "8s" },
  { label: "P", top: "38%", left: "12%", size: 16, delay: "2.1s", duration: "11s" },
  { label: "⭐", top: "58%", left: "92%", size: 18, delay: "0.6s", duration: "9s" },
  { label: "+2,000P", top: "78%", left: "6%", size: 13, delay: "1.8s", duration: "12s" },
  { label: "P", top: "88%", left: "85%", size: 16, delay: "0.9s", duration: "9.5s" },
];

export default function FloatingPoints() {
  return (
    <div className="floatingLayer" aria-hidden="true">
      {CHIPS.map((chip, i) => (
        <span
          key={i}
          className="floatChip"
          style={{
            top: chip.top,
            left: chip.left,
            fontSize: chip.size,
            padding: chip.label.length > 2 ? "8px 14px" : "10px",
            width: chip.label.length <= 2 ? 40 : undefined,
            height: chip.label.length <= 2 ? 40 : undefined,
            animationDelay: chip.delay,
            animationDuration: chip.duration,
          }}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}