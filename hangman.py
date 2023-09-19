hangman = [
 ''' +---+
  |   |
  O   |
      |
      |
      |
=========''', '''
  +---+
  |   |
  O   |
  |   |
      |
      |
=========''', '''
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========''', '''
  +---+
  |   |
  O   |
 /|\  |
      |
      |
=========''', '''
  +---+
  |   |
  O   |
 /|\  |
 /    |
      |
=========''', '''
  +---+
  |   |
  O   |
 /|\  |
 / \  |
      |
=========''']
x="beekeeper"
print("guess the missing letters")
y="_ _ e k e _ p e _ "
print(y)
h='''+---+
  |   |
      |
      |
      |
      |
========='''
print(h)
correct=0
count=1
while count <=6:
    user=input("enter the missing value")
    if user in ['b','e','r']:
        correct+=1
        if(user=='b'):
            y.replace(y[0],'b')
        if user=='e':
            y.replace(y[1],'e')
            y.replace(y[5],'e')
        if user == 'r':
            y.replace(y[8],'r')
    if(correct==3):
        print(x)
        break
    elif user not in ['b','e','r']:
        print(hangman[count])
        count+=1
    if count==6:
        print("u died")
        break