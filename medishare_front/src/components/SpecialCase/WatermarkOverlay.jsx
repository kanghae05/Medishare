import { useEffect, useRef } from "react";

export default function WatermarkOverlay({ user }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext("2d");

    const draw = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = "16px sans-serif";
      context.fillStyle = "#111";
      context.rotate(-Math.PI / 8);

      const userId = user?.memberId ?? user?.id ?? user?.sub ?? "";
      const label = `${user?.name ?? "사용자"} ${userId} · ${new Date().toLocaleString()}`;
      for (let y = -canvas.height; y < canvas.height * 2; y += 100) {
        for (let x = -canvas.width; x < canvas.width * 2; x += 360) {
          context.fillText(label, x, y);
        }
      }
    };

    draw();
    const timer = setInterval(draw, 60000);
    window.addEventListener("resize", draw);
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", draw);
    };
  }, [user]);

  return <canvas ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.15, zIndex: 10 }} />;
}
