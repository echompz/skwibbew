"use client"

import type React from "react"
import { type FC, useState, useEffect, useRef } from "react"
import { useDraw } from "../../hooks/useDraw"
import Image from "next/image"

type PageProps = Record<string, never> // Empty props object properly typed

interface Draw {
  prevPoint: Point | null
  current: Point
  ctx: CanvasRenderingContext2D
}

interface Point {
  x: number
  y: number
}

const Page: FC<PageProps> = () => { // Renamed to uppercase Page
  const [isErasing, setIsErasing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const eraserRef = useRef<HTMLImageElement>(null)
  const eraserX = useRef(40)

  const { canvasRef, onMouseDown, clear } = useDraw(drawLine)

  // Function to handle eraser movement
  const moveEraser = (e: MouseEvent) => {
    if (!isErasing || !isDragging) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left

    // Constrain eraser to canvas bounds
    const boundedX = Math.max(40, Math.min(mouseX, canvas.width))

    // Update eraser X position
    eraserX.current = boundedX

    if (eraserRef.current) {
      eraserRef.current.style.left = `${boundedX + 100 - 31}px` // 100 is canvas left offset
    }

    // Get canvas context
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Erase a vertical line at the eraser's x position
    ctx.clearRect(boundedX - 5, 0, 10, canvas.height)
  }

  // Set up event listeners for eraser movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isErasing && isDragging) {
        e.preventDefault() // Prevent default browser behavior
        moveEraser(e)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault() // Prevent default browser behavior
      setIsDragging(false)
      setIsErasing(false) // Stop erasing when mouse is released
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isErasing, isDragging, moveEraser]) // Added moveEraser to dependencies

  function drawLine({ prevPoint, current, ctx }: Draw) {
    if (isErasing) {
      // Erasing is handled separately
      return
    } else {
      // If drawing, draw lines
      const { x: currX, y: currY } = current
      const lineColor = "#454545"
      const lineWidth = 12

      const startPoint = prevPoint ?? current
      ctx.beginPath()
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = lineColor
      ctx.moveTo(startPoint.x, startPoint.y)
      ctx.lineTo(currX, currY)
      ctx.stroke()

      ctx.fillStyle = lineColor
      ctx.beginPath()
      ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  // Start dragging and erasing when mouse down on eraser
  const handleEraserMouseDown = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent default browser behavior
    setIsErasing(true)
    setIsDragging(true)

    // Get initial position for drag start
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left

      // Erase at the initial position too
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(mouseX - 5, 0, 10, canvas.height)
      }
    }
  }

  // Disable erasing when clicking elsewhere (but keep eraser position)
  const handleCanvasClick = () => {
    if (isErasing) {
      setIsErasing(false)
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col gap-2 pr-10">
        {/* Canvas with overlay */}
        <div className="relative w-[800px] h-[602px]" onClick={handleCanvasClick}>
          <canvas
            onMouseDown={onMouseDown}
            ref={canvasRef}
            width={550}
            height={450}
            className="absolute top-[100px] left-[100px] border border-black rounded-md bg-gray-200"
          />
          <Image
            src="/skwibbew board.png"
            alt="Frame"
            className="absolute top-0 left-0 pointer-events-none"
            fill
            sizes="800px"
            priority
          />

          {/* Always visible, position-persistent eraser */}
          <Image
            ref={eraserRef}
            src="/Skwibbew eraser.png"
            alt="Eraser"
            width={62}
            height={38}
            className={`absolute cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
            style={{
              top: "550px", // Fixed Y position (adjusted to be inside the drawing area)
              left: `${eraserX.current + 100 - 31}px`, // X position saved between drags, 100 is canvas left offset
              transform: "rotate(90deg)",
              zIndex: 10,
            }}
            onMouseDown={handleEraserMouseDown}
            draggable={false} // Prevent default drag behavior
            priority
          />
        </div>

        <div className="w-full flex justify-center gap-2">
          <button
            type="button"
            onClick={clear}
            className="px-4 py-2 rounded-full border border-black hover:bg-[#a8ede2] transition-all duration-100 hover:scale-105 flex items-center gap-2"
          >
            <span>clear canvas</span>
          </button>
        </div>
      </div>

      {/* Crab image */}
      <a href="https://github.com/echompz" className="absolute bottom-10 right-10 transition-transform duration-300 hover:rotate-12">
        <Image
          src="/crab.png"
          alt="Crab"
          width={100}
          height={100}
          style={{
            zIndex: 10,
          }}
          priority
        />
      </a>
    </div>
  )
}

export default Page