import { useEffect, useRef } from "react";

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const starColors = [
      [255, 255, 255],   // white
      [186, 230, 253],   // light blue
      [253, 224, 171],   // warm gold
      [209, 250, 229],   // soft green
      [243, 232, 255],   // soft purple
      [254, 205, 211],   // soft pink
    ];

    const orbs = [
      { x: 0.15, y: 0.3, radius: 350, color: [34, 211, 238], speed: 0.0006, phase: 0 },
      { x: 0.75, y: 0.6, radius: 300, color: [139, 92, 246], speed: 0.0004, phase: 2 },
      { x: 0.5, y: 0.2, radius: 250, color: [245, 158, 11], speed: 0.0007, phase: 4 },
    ];

    const stars = [];
    const createStars = () => {
      stars.length = 0;
      const count = Math.floor((canvas.width * canvas.height) / 5000);
      for (let i = 0; i < count; i++) {
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        const size = Math.random() * 1.8 + 0.3;
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size,
          color,
          opacity: Math.random() * 0.4 + 0.15,
          driftX: (Math.random() - 0.5) * 0.08,
          driftY: (Math.random() - 0.5) * 0.05,
        });
      }
    };

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach((orb) => {
        const cx = canvas.width * (orb.x + Math.sin(time * orb.speed + orb.phase) * 0.04);
        const cy = canvas.height * (orb.y + Math.cos(time * orb.speed * 0.7 + orb.phase) * 0.03);
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.radius);
        gradient.addColorStop(0, `rgba(${orb.color.join(",")}, 0.025)`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      stars.forEach((star) => {
        star.x += star.driftX;
        star.y += star.driftY;

        if (star.x < -10) star.x = canvas.width + 10;
        if (star.x > canvas.width + 10) star.x = -10;
        if (star.y < -10) star.y = canvas.height + 10;
        if (star.y > canvas.height + 10) star.y = -10;

        const [r, g, b] = star.color;

        const gradient = ctx.createRadialGradient(
          star.x - star.size * 0.3, star.y - star.size * 0.3, 0,
          star.x, star.y, star.size
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity * 0.8})`);
        gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${star.opacity})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${star.opacity * 0.3})`);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    createStars();
    animationId = requestAnimationFrame(animate);

    const handleResize = () => { resize(); createStars(); };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
