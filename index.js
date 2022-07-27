
const scoreEl = document.querySelector('#scoreEl')
const statusOver = document.querySelector('#statusOver')
const scoreFinal = document.querySelector('#scoreFinal')
const scoreParrafo = document.querySelector('#scoreParrafo')
const saludo = document.querySelector('#saludo')
const canvas = document.querySelector('canvas');

const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
    constructor() {
        this.velocity ={
            x: 0,
            y: 0
        }

        this.opacity = 1

        const image = new Image()
        image.src = './img/spaceship.png'
        image.onload = () => {
            this.image = image
            this.width = image.width * 0.20
            this.height = image.height * 0.20

            this.position ={
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
        }

    }
    draw() {
        // c.fillStyle = 'red'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)

        c.save()
        c.globalAlpha = this.opacity
        c.drawImage(this.image, 
            this.position.x, 
            this.position.y,
            this.width,
            this.height)
        c.restore()
    }
    update() {
        if(this.image) {
            this.draw()
            this.position.x += this.velocity.x
        }
    }

}

class Projectile {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity

        this.radius = 4
    }
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'red'
        c.fill()
        c.closePath()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Invader {
    constructor({position}) {

        this.velocity ={
            x: 0,
            y: 0
        }
        const image = new Image()
        image.src = './img/invader.png'
        image.onload = () => {
            this.image = image
            this.width = image.width
            this.height = image.height 

            this.position ={
                x: position.x,
                y: position.y
            }
        }

    }
    draw() {
        // c.fillStyle = 'red'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)

        c.drawImage(this.image, 
            this.position.x, 
            this.position.y,
            this.width,
            this.height)
    }
    update({velocity}) {
        if(this.image) {
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y
        }
    }
    shoot(invaderProjectiles) {
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                x: 0,
                y: 5
            }
        }))
    }
}

class InvaderProjectile {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity

        this.width = 3
        this.height = 10
    }

    draw() {
        c.fillStyle = 'yellow'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }
        this.velocity = {
            x: 3,
            y: 0
        }
        this.invaders = []

        const rows = Math.floor(Math.random() * 5 + 2)
        const columns = Math.floor(Math.random() * 10 + 10)

        this.width = columns * 30
        
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
            this.invaders.push(new Invader({
                position: {
                    x: x *30,
                    y: 20 + y *30
                }
            }))
            }
        }
    }
    
    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.velocity.y = 0

        if(this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = - this.velocity.x
            this.velocity.y = 30
        }
    }
}

class Particle {
    constructor({position, velocity, radius, color}) {
        this.position = position
        this.velocity = velocity

        this.radius = radius
        this.color = color
    }
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

const player = new Player();
const projectiles = []
const invaderProjectiles = []
const particles = []
const grids = []
const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

let frames = 0;
let game = {
    over: false,
    active: true
}

let score = 0

for (let i = 0; i < 5000; i++) {
    particles.push(new Particle({
        position: {
            x: Math.random() * canvas.width,
            y: ((Math.random() * canvas.height) - canvas.height ) * 30 + Math.random() * canvas.height 
        },
        velocity: {
            x: 0,
            y: Math.random() * 0.4 + 0.2
        },
        radius: Math.random() * 2 + 0.2,
        color: 'white'
    }))    
}

//Ciclo animado
function animate() {
    if(!game.active) return;

    requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    particles.forEach(particle => {

        particle.update()
    })
    invaderProjectiles.forEach((invaderProjectile, index) => {
        if(invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
            },0)
        } else invaderProjectile.update()
        //Projectile hits player
        if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
            invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width) {
                setTimeout(() => {
                    //player.image.src = './img/explo.gif'
                    player.opacity = 0

                    invaderProjectiles.splice(index,1)
                    game.over = true
                },0)
                setTimeout(() => {
                    game.active = false
                    statusOver.style.opacity = 1
                },200)

                if (statusOver.style.opacity = 1) {
                    setTimeout(() => {
                        
                        statusOver.style.opacity = 0
                        scoreFinal.innerHTML = score
                        scoreParrafo.style.opacity = 1
                    }, 3000);
                    setTimeout(() => {
                    
                        saludo.style.opacity = 0.8
                    }, 7000);
                }
   
        }
    })
    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            projectiles.splice(index, 1)
        } else {
            projectile.update()
        }
    })

    grids.forEach((grid, gridIndex) => {
        grid.update()
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }
        grid.invaders.forEach((invader, i) => {
            invader.update({velocity: grid.velocity})

            // Projectiles hit enemy.
            projectiles.forEach((projectile, j) => {
                if(projectile.position.y - projectile.radius <= invader.position.y + invader.height && projectile.position.y + projectile.radius >= invader.position.y && projectile.position.x + projectile.radius >= invader.position.x && projectile.position.x - projectile.radius <= invader.position.x + invader.width) {
                    setTimeout(()=> {
                        const invaderFound = grid.invaders.find(invader2 => invader2 === invader
                        )
                        const projectileFound = projectiles.find(projectile2 => projectile2 === projectile)
                        // Remove invader and projectile
                        if(invaderFound && projectileFound) {
                            score += 100
                            scoreEl.innerHTML = score;

                            grid.invaders.splice(i, 1)
                            projectiles.splice(j, 1)

                            if(grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0]
                                const lastInvader = grid.invaders[grid.invaders.length - 1]

                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                                grid.position.x = firstInvader.position.x
                            } else {
                                grids.splice(gridIndex, 1)
                            }
                        }
                    },0)
                }
            })
        })
    })

    if (keys.a.pressed && player.position.x >= 0) {
        player.velocity.x = -7
    } else if(keys.d.pressed &&
        player.position.x + player.width <= canvas.width) {
        player.velocity.x = 7
    } else {
        player.velocity.x = 0
    }
    //Generando grillas de invasores
    if(frames % 1000 === 0) {
        grids.push((new Grid()))
    }
    frames++
}

animate()

// Movimientos del teclado
addEventListener('keydown', ({key}) => {
    if (game.over) return; 

    switch (key) {
        case 'a':
            keys.a.pressed = true
            break;
        case 'd':
            keys.d.pressed = true
            break;
        case ' ':
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + player.width /2,
                    y: player.position.y
                },
                velocity: {
                    x: 0,
                    y: -7
                }
            }))
            break;
    }
})

addEventListener('keyup', ({key}) => {
    switch (key) {
        case 'a':
            keys.a.pressed = false
            break;
        case 'd':
            keys.d.pressed = false
            break;
        case ' ':
            break;   
    
    }
})