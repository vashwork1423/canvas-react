import React, { useRef, useEffect, useState } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const circle1Ref = useRef({ y: 150, dy: 1, color: 'red', score: 0 });
  const circle2Ref = useRef({ y: 150, dy: 1, color: 'blue', score: 0 });
  const bulletsRef = useRef([]); // Массив для маленьких кругов
  const radius = 50; // Радиус больших кругов
  const bulletRadius = 5; // Радиус маленьких кругов
  const bulletSpeed = 3; // Скорость маленьких кругов
  const speed1Ref = useRef(0.5); // Используем useRef для хранения скорости первого круга
  const speed2Ref = useRef(0.5); // Используем useRef для хранения скорости второго круга

  const [speed1, setSpeed1] = useState(0.5);
  const [speed2, setSpeed2] = useState(0.5);
  const [menu, setMenu] = useState({ open: false, x: 0, y: 0, circle: null });

  const colors = ['red', 'green', 'blue', 'yellow', 'purple'];

  useEffect(() => {
    speed1Ref.current = speed1;
  }, [speed1]);

  useEffect(() => {
    speed2Ref.current = speed2;
  }, [speed2]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    let lastTimestamp = 0;

    function drawRectangle() {
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, width, height);
    }

    function drawCircle(x, y, color) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    function drawBullet(x, y, color) {
      ctx.beginPath();
      ctx.arc(x, y, bulletRadius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }

    function drawLine() {
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    function drawScore(x, y, score) {
      ctx.font = '24px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText(score.toString(), x, y - radius - 20);
    }

    function checkCollision(bullet, circleX, circleY) {
      const distX = bullet.x - circleX;
      const distY = bullet.y - circleY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      return distance < radius + bulletRadius;
    }

    function checkBulletCollision(bullet1, bullet2) {
      const distX = bullet1.x - bullet2.x;
      const distY = bullet1.y - bullet2.y;
      const distance = Math.sqrt(distX * distX + distY * distY);
      return distance < 2 * bulletRadius;
    }

    function handleCircleClick(circle, x, y) {
      setMenu({ open: true, x, y, circle });
    }

    function animate(timestamp) {
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      ctx.clearRect(0, 0, width, height);

      drawRectangle();
      drawLine();

      const circle1 = circle1Ref.current;
      const circle2 = circle2Ref.current;

      // Обновление положения первого круга
      circle1.y += circle1.dy * speed1Ref.current;
      if (circle1.y > height - radius || circle1.y < radius) {
        circle1.dy = -circle1.dy;
      }

      // Обновление положения второго круга
      circle2.y += circle2.dy * speed2Ref.current;
      if (circle2.y > height - radius || circle2.y < radius) {
        circle2.dy = -circle2.dy;
      }

      if (Math.random() < 0.02) {
        const angle = Math.atan2(circle2.y - circle1.y, 650 - 150);
        bulletsRef.current.push({
          x: 150,
          y: circle1.y,
          dx: Math.cos(angle) * bulletSpeed,
          dy: Math.sin(angle) * bulletSpeed,
          color: circle1.color,
        });
      }

      if (Math.random() < 0.02) {
        const angle = Math.atan2(circle1.y - circle2.y, 150 - 650);
        bulletsRef.current.push({
          x: 650,
          y: circle2.y,
          dx: Math.cos(angle) * bulletSpeed,
          dy: Math.sin(angle) * bulletSpeed,
          color: circle2.color,
        });
      }

      bulletsRef.current = bulletsRef.current.filter((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        const hitCircle1 = bullet.color !== circle1.color && checkCollision(bullet, 150, circle1.y);
        const hitCircle2 = bullet.color !== circle2.color && checkCollision(bullet, 650, circle2.y);

        if (hitCircle2) {
          circle1.color = 'orange';
          circle1.score += 1;
          setTimeout(() => (circle1.color = circle1Ref.current.color), 200);
        }

        if (hitCircle1) {
          circle2.color = 'orange';
          circle2.score += 1;
          setTimeout(() => (circle2.color = circle2Ref.current.color), 200);
        }

        let hitOtherBullet = false;
        for (let i = 0; i < bulletsRef.current.length; i++) {
          if (i !== index && checkBulletCollision(bullet, bulletsRef.current[i])) {
            hitOtherBullet = true;
            bulletsRef.current.splice(i, 1);
            break;
          }
        }

        if (!hitCircle1 && !hitCircle2 && !hitOtherBullet) {
          drawBullet(bullet.x, bullet.y, bullet.color);
          return bullet.x > 0 && bullet.x < width && bullet.y > 0 && bullet.y < height;
        }
        return false;
      });

      ctx.canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x >= 150 - radius && x <= 150 + radius && y >= circle1.y - radius && y <= circle1.y + radius) {
          handleCircleClick(circle1Ref.current, e.clientX, e.clientY);
        } else if (x >= 650 - radius && x <= 650 + radius && y >= circle2.y - radius && y <= circle2.y + radius) {
          handleCircleClick(circle2Ref.current, e.clientX, e.clientY);
        }
      });

      drawCircle(150, circle1.y, circle1.color);
      drawCircle(650, circle2.y, circle2.color);

      drawScore(150, circle1.y, circle1.score);
      drawScore(650, circle2.y, circle2.score);

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, []); // Убираем зависимость от speed1 и speed2

  function handleColorSelect(color) {
    if (menu.circle) {
      menu.circle.color = color;
    }
    setMenu({ ...menu, open: false });
  }

  return (
    <div className="App">
      <canvas ref={canvasRef} width={800} height={400}></canvas>
      <div className="controls">
        <div>
          <label>Speed Circle 1: {speed1.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={speed1}
            onChange={(e) => setSpeed1(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>Speed Circle 2: {speed2.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={speed2}
            onChange={(e) => setSpeed2(parseFloat(e.target.value))}
          />
        </div>
      </div>

      {menu.open && (
        <div className="menu" style={{ position: 'absolute', left: menu.x, top: menu.y, background: 'white', border: '1px solid black', padding: '10px' }}>
          <p>Select a color:</p>
          {colors.map((color) => (
            <button key={color} onClick={() => handleColorSelect(color)} style={{ backgroundColor: color, margin: '5px' }}>
              {color}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
