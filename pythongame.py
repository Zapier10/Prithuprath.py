import pygame 
import math
import random

pygame.init()
screen = pygame.display.set_mode((800, 600))
pygame.display.set_caption("Space Invader")
background = pygame.image.load('space.jpg')
# player
playerImg = pygame.image.load('battleship 3.png')
playerX = 370
playerY = 480
playerX_change = 0
playerY_change = 0
# enemy
enemyImg = pygame.image.load('enemy 2.png')
enemyX = random.randint(0, 800)
enemyY = random.randint(50, 150)
enemyX_change = 0.5
enemyY_change = 1
# bullet
bulletImg = pygame.image.load('bullet.png')
bulletX = playerX
bulletY = 480
bulletX_change = 0
bulletY_change = 2
bullet_state = "ready"
score = 0
# bullet enemy
bullet_enemyImg = pygame.image.load('bullet.png')
bullet_enemyX = enemyX
bullet_enemyY = enemyY
bullet_changeenemyX = 0
bullet_changeenemyY = 1
enemy_bullet_state = "ready"


def player(x, y):
    screen.blit(playerImg, (x, y))


def enemy(x, y):
    screen.blit(enemyImg, (x, y))


def fire_bullet(x, y):
    global bullet_state
    bullet_state = "fire"
    screen.blit(bulletImg, (x + 16, y + 10))


def enemy_fire_bullet(x, y):
    global enemy_bullet_state
    enemy_bullet_state = "fire"
    screen.blit(bullet_enemyImg, (x + 16, y + 10))


def isCollision(enemyX, enemyY, bulletX, bulletY):
    distance = math.sqrt((math.pow(enemyX - bulletX, 2)) + (math.pow(enemyY - bulletX, 2)))
    if distance < 27:
        return True
    else:
        return False
def isenemycollsion(playerX,playerY,bullet_enemyX,bullet_enemyY):
    distance2=math.sqrt((math.pow(playerX-bullet_enemyX,2))+(math.pow(playerY-bullet_enemyY,2)))
    if distance2<=27:
        return True
    else:
        return False

# game loop
running = True
while running:
    screen.fill((0, 0, 0,))
    screen.blit(background, (0, 0))
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            print("keystroke has been pressed")
            if event.key == pygame.K_LEFT:
                playerX_change = -0.4
            if event.key == pygame.K_UP:
                playerY_change = -0.4
            if event.key == pygame.K_RIGHT:
                playerX_change = 0.4
            if event.key == pygame.K_DOWN:
                playerY_change = 0.4
            if event.key == pygame.K_SPACE:
                if bullet_state is "ready":
                    bulletX = playerX
                    fire_bullet(bulletX, bulletY)

            if event.key==pygame.K_SPACE:
                if enemy_bullet_state is "ready":
                    bullet_enemyX=enemyX
                    enemy_fire_bullet(bullet_enemyX, bullet_enemyY)
        if event.type == pygame.KEYUP:
            if event.key == pygame.K_LEFT or event.key == pygame.K_RIGHT:
                print("keystroke has been released")
                playerX_change = 0
            if event.key == pygame.K_UP or event.key == pygame.K_DOWN:
                playerY_change = 0
    # player movements
    playerX += playerX_change
    if playerX <= 0:
        playerX = 0
    elif playerX >= 736:
        playerX = 736
    playerY += playerY_change
    if playerY < 0:
        playerY = 0
    elif playerY >= 536:
        playerY = 536
    # enemy movements
    enemyX += enemyX_change
    if enemyX <= 0:
        enemyX_change = 0.5
    if enemyX >= 736:
        enemyX_change = -0.5
    enemyY += enemyY_change
    if enemyY <= 0:
        enemyY_change = 0.5
    if enemyY >= 536:
        enemyY_change = -0.5
    # bullet movements
    if bulletY <= 0:
        bulletY = playerY
        bullet_state = "ready"
    if bullet_state is "fire":
        fire_bullet(bulletX, bulletY)
        bulletY -= bulletY_change
    # enemy bullet movements
    if bullet_enemyY>=600:
        bullet_enemyY=enemyY
        enemy_bullet_state= "ready"
    if enemy_bullet_state is "fire":
        enemy_fire_bullet(bullet_enemyX,bullet_enemyY)
        bullet_enemyY+=bullet_changeenemyY
    # collision
    collision = isCollision(enemyX, enemyY, bulletX, bulletY)
    if collision:
        bulletY = playerY
        bullet_state = "ready"
        score += 1
        print(score)
        enemyX = random.randint(0, 800)
        enemyY = random.randint(50, 150)
    collision2=isenemycollsion(playerX,playerY,bullet_enemyX,bullet_enemyY)
    if collision2:
        bullet_enemyY=enemyY
        enemy_bullet_state="ready"
        print("you r out")







    player(playerX, playerY)
    enemy(enemyX, enemyY)
    pygame.display.update()