// basic context
let c = document.createElement('canvas').getContext('2d')
let canvas = c.canvas
// post processing
let postctx = document.body.appendChild(document.createElement('canvas')).getContext('2d')

// Common
let mountains = []
let stars = []
let depth = 200
let frame = 0
let cameraY = 0
let oceanHeight = 300

// Theme
let skyColor = "#35006a"
let mountainColor = "#f5a462"

// Mountains
let createMountain = (x, y, z) => {
   let size = 0.2 + Math.random();
   size *= 200
   mountains.push({
      position: { x, y, z },
      render () {
         let { x, y, z } = this.position
         let depthPercent = 1 - z / depth
         y += canvas.height - oceanHeight
         this.position.x += 0.4
         if (depthPercent > 0) {
            x /= depthPercent / 10
            
            if (x > canvas.width + size) {
               this.position.x = -size
            }
            y += (cameraY) * (1 - depthPercent) * 2
         }
         
         
         c.fillStyle = skyColor
         c.beginPath()
         c.moveTo(x - size, y)
         c.lineTo(x + size, y)
         c.lineTo(x, y - size)
         c.fill()
         c.fillStyle = mountainColor
         c.globalAlpha = z / depth * 2
         c.fill()
         c.globalAlpha = 1
      }
   })
}

let createStar = (x, y) => {
   let size = Math.random() > 0.5 ? 4 : 2
   stars.push({
      position: { x, y },
      render () {
         let { x, y } = this.position
         this.position.x += 0.0002
         if (this.position.x > 1) {
            this.position.x = 0
         }
         
         x *= canvas.width
         y *= canvas.height
         
         y += -cameraY / 4
         c.save()
         c.translate(x, y)
         c.rotate(Math.PI / 4)
         c.fillStyle = "#fff"
         c.fillRect( - size / 2, - size / 2, size, size)
         c.restore()
      }
   })
}


let resize = () => {
   if (postctx.canvas.width !== postctx.canvas.offsetWidth || postctx.canvas.height !== postctx.canvas.offsetHeight) {
      postctx.canvas.width = canvas.width = postctx.canvas.offsetWidth
      postctx.canvas.height = canvas.height = postctx.canvas.offsetHeight
   }
}
let loop = () => {
   frame++
   cameraY = Math.abs(128 + Math.sin(frame / 100) * 128)
   
   resize()
   
   c.fillStyle = skyColor
   c.fillRect(0, 0, canvas.width, canvas.height)
   
   stars.forEach(star => star.render())
   
   // Drawing moon
   
   c.fillStyle = "#ffefc4"
   c.beginPath()
   c.arc(canvas.width / 2, canvas.height - oceanHeight / 2 - cameraY / 2, 200, Math.PI * 2, 0)
   c.shadowBlur = 128
   c.shadowColor = "#e3406b"
   c.fill()
   c.shadowBlur = 0
   
   // Drawing Ocean
   c.fillStyle = c.createLinearGradient(0, canvas.height, 0, canvas.height - oceanHeight)
   c.fillStyle.addColorStop(1, skyColor)
   c.fillStyle.addColorStop(0, "#b616ae")
   c.fillRect(0, canvas.height, canvas.width, -oceanHeight)
   
   mountains.forEach(mountain => mountain.render())
   
   postctx.drawImage(canvas, 0, 0)
   postctx.filter = "blur(32px)"
   postctx.globalCompositeOperation = "lighter"
   postctx.drawImage(canvas, 0, 0)
   postctx.globalCompositeOperation = "source-over"
   postctx.filter = "blur(0)"
   
   requestAnimationFrame(loop)
}

loop()

for (let i = 0; i < 50; i++) {
   createMountain(Math.random() * canvas.width, 0, i / (100) * depth)
   createStar(Math.random(), Math.random())
}

mountains.sort((a, b) => a.position.z - b.position.z)