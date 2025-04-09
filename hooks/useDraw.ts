export type Point = {
    x: number
    y: number
  }
  
  export type Draw = {
    ctx: CanvasRenderingContext2D
    current: Point
    prevPoint: Point | null
  }

import { useEffect, useRef, useState } from "react"

export const useDraw = (onDraw: ({ctx,current,prevPoint}: Draw)=>void) => {
    const [mouseDown,setMouseDown] = useState(false)

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const prevPoint = useRef<Point|null>(null)

    const onMouseDown = () => setMouseDown(true)

    const clear = () => {
        const canvas = canvasRef.current
        if(!canvas) return
        const ctx = canvas.getContext('2d')
        if(!ctx) return
        ctx.clearRect(0,0,canvas.width,canvas.height)

    }

    useEffect(() => {
        
        const handler = (e: MouseEvent) => {
            //console.log({x: e.clientX, y: e.clientY})

            if(!mouseDown) return

            const current = computePointInCanvas(e)
            const ctx = canvasRef.current?.getContext('2d')
            if(!ctx || !current) return
            
            onDraw({
                ctx, current, prevPoint: prevPoint.current
            })
            prevPoint.current = current
        }

        const computePointInCanvas = (e: MouseEvent) => {
            const canvas = canvasRef.current
            if(!canvas) return

            const rect = canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            return {x, y}
        }

        const mouseUpHandler = () => {
            setMouseDown(false)
            prevPoint.current = null
        }

        //add event listeners
        canvasRef.current?.addEventListener("mousemove", handler)
        window.addEventListener("mouseup", mouseUpHandler)

        //cleanup event listeners
        return() => {
            canvasRef.current?.removeEventListener("mousemove", handler)    
            window.removeEventListener("mouseup", mouseUpHandler)
        }
    }, [onDraw])
    return {canvasRef, onMouseDown,clear}
}