#Importing random module for random card distribution
from random import *
#deck with the player 
def pshuffle(c,p):
    i=0
    while i<2:
        p.append(choice(c))
        i+=1
#deck with the dealer 
def dshuffle(c,d):
    i=0
    while i<2:
        d.append(choice(c))
        i+=1 
#winner function to determine the winner
def winner(p1,d1):
    print("Player's value: ",p1)
    print("Dealer's value: ",d1)
    if(p1>21 or d1>21):
        if p1>21:
            print("dealer wins")
        if(d1>21):
            print("player wins")
    else:
        if(p1==d1):
            print("draw")
        elif(p1>d1):
            print('player wins')
        else:
            print("dealer wins")
cards=[11,1,2,3,4,5,6,7,8,9,10,10,10,10]
print("Welcome to BlackJack")
#Game on 
while True:
    dealer=[]
    player=[]
    pshuffle(cards,player) #Distributing the cards to the player 
    dshuffle(cards,dealer) #Distributing the cards to the dealer
    pvalue=sum(player) #Calculating the sum of the cards with player
    dvalue=sum(dealer)#Calculating the sum of the cards with dealer 
    #Player's turn to play
    print("player's turn")
    print("player's deck: ",player)
    print("player's value",pvalue)
    print("1:select a card")
    print("2:make the dealer hit")
    pchoice=int(input())
    if choice==1:
        p=choice(cards)
        if p==cards[0]:
            pc=int(input("It is an ace choose it's value i.e 1 or 11"))
            p=pc
        player.append(p)
        pvalue+=p
    elif choice==2:
        sub=21-dvalue #Condition to train the dealer 
        if dvalue<17:
            d=choice(cards)
            if d == cards[0]: #Training the dealer to choose wisely btw 1 and 11 when encountered an ace 
                if sub<10:
                    d=1
                else:
                    d=11
            dealer.append(d)
            dvalue+=d
    winner(pvalue,dvalue) #Function called to decide the winner
    print("want to continue")
    ch=input()
    if ch == "no" or ch=="NO":
        break            


    
    