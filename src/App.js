import React, { useRef, useEffect } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const circle1Ref = useRef({ y: 150, dy: 1 });
  const circle2Ref = useRef({ y: 150, dy: 1 });
  const bulletsRef = useRef([]); // Массив для маленьких кругов
  const radius = 50; // Радиус больших кругов
  const bulletRadius = 5; // Радиус маленьких кругов
  const speed = 0.5; // Замедленный коэффициент
  const bulletSpeed = 3; // Скорость маленьких кругов

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    let lastTimestamp = 0; // Для отслеживания времени

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

    function animate(timestamp) {
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      ctx.clearRect(0, 0, width, height); // Очистка холста

      drawRectangle();
      drawLine();

      // Обновляем положение первого круга
      const circle1 = circle1Ref.current;
      let newY1 = circle1.y + circle1.dy * (deltaTime / 16.67) * speed; // Учитываем время
      if (newY1 > height - radius || newY1 < radius) {
        circle1.dy = -circle1.dy; // Изменяем направление
      } else {
        circle1.y = newY1;
      }

      // Обновляем положение второго круга
      const circle2 = circle2Ref.current;
      let newY2 = circle2.y + circle2.dy * (deltaTime / 16.67); // Учитываем время
      if (newY2 > height - radius || newY2 < radius) {
        circle2.dy = -circle2.dy; // Изменяем направление
      } else {
        circle2.y = newY2;
      }

      // Создание маленького круга (пули) из круга 1 в сторону круга 2
      if (Math.random() < 0.02) { // Создавать пулю с некоторой вероятностью
        const angle = Math.atan2(circle2.y - circle1.y, 650 - 150);
        bulletsRef.current.push({
          x: 150,
          y: circle1.y,
          dx: Math.cos(angle) * bulletSpeed,
          dy: Math.sin(angle) * bulletSpeed,
          color: 'red',
        });
      }

      // Создание маленького круга (пули) из круга 2 в сторону круга 1
      if (Math.random() < 0.02) { // Создавать пулю с некоторой вероятностью
        const angle = Math.atan2(circle1.y - circle2.y, 150 - 650);
        bulletsRef.current.push({
          x: 650,
          y: circle2.y,
          dx: Math.cos(angle) * bulletSpeed,
          dy: Math.sin(angle) * bulletSpeed,
          color: 'blue',
        });
      }

      // Обновляем и рисуем пули
      bulletsRef.current = bulletsRef.current.filter(bullet => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        drawBullet(bullet.x, bullet.y, bullet.color);
        return bullet.x > 0 && bullet.x < width && bullet.y > 0 && bullet.y < height;
      });

      drawCircle(150, circle1.y, 'red');
      drawCircle(650, circle2.y, 'blue');

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate); // Запуск анимации

    return () => {
      // Очистка при размонтировании (если нужно)
    };
  }, []); // Пустой массив зависимостей, чтобы избежать бесконечных обновлений

  return (
    <div className="App">
      <canvas ref={canvasRef} width={800} height={400}></canvas>
    </div>
  );
}

export default App;
