import turtle
import random
import math
import time

# Screen Setup
screen = turtle.Screen()
screen.setup(800, 800)
screen.bgcolor("black")
screen.title("Space Game with Black Hole and Planets")
turtle.tracer(0)

# Sprite Base Class
class Sprite(turtle.Turtle):
    def __init__(self, shape, color, x, y):
        super().__init__(shape=shape)
        self.penup()
        self.color(color)
        self.goto(x, y)
        self.move_speed = 1

    def move(self):
        self.fd(self.move_speed)
        # Bounce off screen
        if self.xcor() > 390 or self.xcor() < -390:
            self.setheading(180 - self.heading())
        if self.ycor() > 390 or self.ycor() < -390:
            self.setheading(-self.heading())

    def is_collision(self, other):
        return self.distance(other) < 20

# Player Class
class Player(Sprite):
    def __init__(self):
        super().__init__("triangle", "white", 0, -100)
        self.move_speed = 2
        self.lives = 3
        self.boost_time = 0

    def turn_left(self): self.left(30)
    def turn_right(self): self.right(30)

    def accelerate(self):
        self.move_speed += 1
        self.move_speed = min(self.move_speed, 10)

    def decelerate(self):
        self.move_speed -= 1
        self.move_speed = max(self.move_speed, 1)

# Enemy Class
class Enemy(Sprite):
    def __init__(self):
        x, y = random.randint(-300, 300), random.randint(-300, 300)
        super().__init__("circle", "red", x, y)
        self.setheading(random.randint(0, 360))
        self.move_speed = random.randint(2, 4)

# Missile Class
class Missile(Sprite):
    def __init__(self):
        super().__init__("square", "yellow", -1000, 1000)
        self.shapesize(0.3, 0.3)
        self.status = "ready"
        self.move_speed = 25

    def fire(self, player):
        if self.status == "ready":
            self.goto(player.xcor(), player.ycor())
            self.setheading(player.heading())
            self.status = "firing"

    def move(self):
        if self.status == "firing":
            self.fd(self.move_speed)
            if abs(self.xcor()) > 400 or abs(self.ycor()) > 400:
                self.goto(-1000, 1000)
                self.status = "ready"

# Game Class
class Game():
    def __init__(self):
        self.score = 0
        self.pen = turtle.Turtle()
        self.pen.hideturtle()
        self.pen.color("white")
        self.pen.penup()

    def update_status(self):
        self.pen.clear()
        self.pen.goto(-380, 360)
        self.pen.write(f"Score: {self.score} | Lives: {player.lives}", font=("Arial", 16, "bold"))

# Circular Planets
planet_colors = ["blue", "green", "orange", "purple", "pink", "cyan", "magenta", "yellow"]
def create_planets(radius=300, count=8):
    planets = []
    for i in range(count):
        angle = 2 * math.pi * i / count
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        p = turtle.Turtle()
        p.shape("circle")
        p.color(random.choice(planet_colors))
        p.shapesize(1.5)
        p.penup()
        p.goto(x, y)
        planets.append(p)
    return planets

# Black Hole with Animation
black_hole = turtle.Turtle()
black_hole.shape("circle")
black_hole.color("white")
black_hole.shapesize(2.5)
black_hole.penup()
black_hole.goto(0, 0)

# Gravitational swirl animation
swirl = turtle.Turtle()
swirl.hideturtle()
swirl.speed(0)
swirl.color("white")
swirl.pensize(1)

def animate_swirl():
    swirl.clear()
    swirl.penup()
    swirl.goto(0, 0)
    swirl.setheading(0)
    swirl.pendown()
    for i in range(150):
        swirl.fd(1.5 + i * 0.1)
        swirl.left(15)
    turtle.update()
    turtle.ontimer(animate_swirl, 200)

# Setup game elements
player = Player()
missile = Missile()
game = Game()
game.update_status()
enemies = [Enemy() for _ in range(5)]
planets = create_planets()
animate_swirl()

# Controls
screen.listen()
screen.onkey(player.turn_left, "Left")
screen.onkey(player.turn_right, "Right")
screen.onkey(player.accelerate, "Up")
screen.onkey(player.decelerate, "Down")
screen.onkey(lambda: missile.fire(player), "space")

# Slingshot Detection
def check_slingshot():
    if 100 < player.distance(black_hole) < 130:
        angle_diff = abs(player.heading() - player.towards(black_hole))
        if 75 <= angle_diff <= 105:
            if player.boost_time <= 0:
                player.move_speed += 3
                player.boost_time = time.time()
                print("Slingshot Boost!")

def handle_boost():
    if player.boost_time > 0 and time.time() - player.boost_time > 5:
        player.move_speed -= 3
        player.boost_time = 0

# Game Loop
def game_loop():
    player.move()
    missile.move()
    for enemy in enemies:
        enemy.move()

        if player.is_collision(enemy):
            enemy.goto(random.randint(-300, 300), random.randint(-300, 300))
            player.lives -= 1
            game.update_status()
            if player.lives <= 0:
                game.pen.goto(-80, 0)
                game.pen.write("GAME OVER", font=("Arial", 24, "bold"))
                return

        if missile.is_collision(enemy):
            enemy.goto(random.randint(-300, 300), random.randint(-300, 300))
            missile.status = "ready"
            missile.goto(-1000, 1000)
            game.score += 10
            game.update_status()

    for planet in planets:
        if player.is_collision(planet):
            player.lives -= 1
            game.update_status()
            if player.lives <= 0:
                game.pen.goto(-80, 0)
                game.pen.write("GAME OVER", font=("Arial", 24, "bold"))
                return

    check_slingshot()
    handle_boost()

    turtle.update()
    turtle.ontimer(game_loop, 20)

game_loop()
turtle.mainloop()
