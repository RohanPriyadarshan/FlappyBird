import React, { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
  const GRAVITY = 0.4;         // falling speed
  const JUMP_SPEED = -6;       // upward force
  const PIPE_WIDTH = 60;       // pipe thickness
  const GAP_HEIGHT = 150;      // space between pipes
  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 500;
  const BIRD_SIZE = 30;

  const [birdY, setBirdY] = useState(250);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const gameRef = useRef(null);

  // Start / restart the game
  const startGame = () => {
    setBirdY(250);
    setVelocity(0);
    setPipes([]);
    setScore(0);
    setIsRunning(true);
    gameRef.current?.focus();
  };

  // Gravity effect
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setVelocity((v) => v + GRAVITY);
      setBirdY((y) => Math.max(0, y + velocity));
    }, 20);

    return () => clearInterval(interval);
  }, [isRunning, velocity]);

  // Pipe generation & movement
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setPipes((prev) => {
        let updated = prev
          .map((pipe) => ({ ...pipe, x: pipe.x - 3 }))
          .filter((pipe) => pipe.x + PIPE_WIDTH > 0);

        // Add a new pipe when needed
        if (prev.length === 0 || prev[prev.length - 1].x < GAME_WIDTH - 200) {
          const topHeight = Math.random() * (GAME_HEIGHT - GAP_HEIGHT - 50);
          updated.push({
            x: GAME_WIDTH,
            top: topHeight,
            bottom: GAME_HEIGHT - (topHeight + GAP_HEIGHT),
            passed: false,
          });
        }

        return updated;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Jump handler
  const handleJump = () => {
    if (!isRunning) return;
    setVelocity(JUMP_SPEED);
  };

  // Keyboard: SPACE to jump
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // Collision detection & scoring
  useEffect(() => {
    if (!isRunning) return;

    pipes.forEach((pipe) => {
      // Collision with pipes
      if (
        50 + BIRD_SIZE > pipe.x &&
        50 < pipe.x + PIPE_WIDTH &&
        (birdY < pipe.top || birdY + BIRD_SIZE > GAME_HEIGHT - pipe.bottom)
      ) {
        setIsRunning(false);
      }

      // Score increment when passing a pipe
      if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
        pipe.passed = true;
        setScore((s) => s + 1);
      }
    });

    // Hit the ground
    if (birdY >= GAME_HEIGHT - BIRD_SIZE) {
      setIsRunning(false);
    }
  }, [pipes, birdY, isRunning]);

  return (
    // This whole thing is now centered by #root's flex in index.css
    <div className="flex flex-col items-center text-white select-none">
      <h1 className="text-3xl font-black mb-2 drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]">
        Flappy Bird
      </h1>
      <p className="mb-4 text-lg text-slate-200">Score: {score}</p>

      {/* GAME AREA */}
      <div
        ref={gameRef}
        tabIndex={0}
        className="game-area relative overflow-hidden rounded-2xl border-4 border-black shadow-[0_12px_0_rgba(0,0,0,0.18)]"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onClick={handleJump}
      >
        <div className="floating-clouds" aria-hidden />

        {/* Bird */}
        <div
          className="bird"
          style={{
            width: BIRD_SIZE,
            height: BIRD_SIZE,
            left: 50,
            top: birdY,
          }}
        ></div>

        {/* Pipes */}
        {pipes.map((pipe, i) => (
          <React.Fragment key={i}>
            {/* Top Pipe */}
            <div
              className="pipe pipe-top"
              style={{
                width: PIPE_WIDTH,
                height: pipe.top,
                left: pipe.x,
                top: 0,
              }}
            ></div>

            {/* Bottom Pipe */}
            <div
              className="pipe pipe-bottom"
              style={{
                width: PIPE_WIDTH,
                height: pipe.bottom,
                left: pipe.x,
                bottom: 0,
              }}
            ></div>
          </React.Fragment>
        ))}

        {/* Ground strip */}
        <div className="ground" />

        {/* Game Over overlay */}
        {!isRunning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white text-center">
            <p className="text-2xl font-bold mb-2">Game Over</p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-white text-black font-bold rounded-lg"
            >
              Start Game
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-slate-400 text-sm">
        Click or press SPACE to jump
      </p>
      <footer className="mt-2 text-slate-500 text-xs">Made by Rohan</footer>
    </div>
  );
}
