type Draw = {
    ctx: CanvasRenderingContext2D
    current: Point
    prevPoint: Point|null
}

type Point = {
    x: number
    y: number
}