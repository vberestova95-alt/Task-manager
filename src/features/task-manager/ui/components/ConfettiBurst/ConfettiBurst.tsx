import type { CSSProperties } from "react";

import "./ConfettiBurst.css";

export function ConfettiBurst() {
  const confettiPieces = [
    { left: "7%", delay: "0ms", duration: "1350ms", rotate: "-18deg", color: "#f6cb79" },
    { left: "14%", delay: "80ms", duration: "1480ms", rotate: "16deg", color: "#db9a71" },
    { left: "22%", delay: "40ms", duration: "1320ms", rotate: "-12deg", color: "#8d74ff" },
    { left: "31%", delay: "140ms", duration: "1520ms", rotate: "20deg", color: "#8dc8ff" },
    { left: "39%", delay: "10ms", duration: "1420ms", rotate: "-22deg", color: "#f5e3a1" },
    { left: "48%", delay: "100ms", duration: "1500ms", rotate: "12deg", color: "#cfa6ff" },
    { left: "57%", delay: "20ms", duration: "1370ms", rotate: "-10deg", color: "#db9a71" },
    { left: "66%", delay: "110ms", duration: "1460ms", rotate: "18deg", color: "#90b8ff" },
    { left: "74%", delay: "60ms", duration: "1390ms", rotate: "-15deg", color: "#f6cb79" },
    { left: "82%", delay: "150ms", duration: "1530ms", rotate: "24deg", color: "#8d74ff" },
    { left: "90%", delay: "30ms", duration: "1410ms", rotate: "-20deg", color: "#f7b6a3" }
  ];

  return (
    <div className="confetti-burst" aria-hidden="true">
      {confettiPieces.map((piece, index) => (
        <span
          key={`${piece.left}-${index}`}
          className="confetti-piece"
          style={
            {
              "--confetti-left": piece.left,
              "--confetti-delay": piece.delay,
              "--confetti-duration": piece.duration,
              "--confetti-rotate": piece.rotate,
              "--confetti-color": piece.color
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
