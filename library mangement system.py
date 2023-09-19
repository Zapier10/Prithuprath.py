import mysql.connector
from tabulate import tabulate
from datetime import date

db= mysql.connector.connect(
        host= 'localhost',
        user= 'root',
        password= '12345',
        database = 'library'
)

cursor = db.cursor()

while True:
    print("Press 1 to borrow a book", "\n")
    print("Press 2 to return a previously borrowed book" "\n")
    print("Press 3 to exit", "\n")
        
    b= input("Enter your response ")
    if b == "2":
                bookret=input("\n\nEnter the name of the book you had borrowed ")
                date1= input("\nEnter the date you borrowed the book (DD/MM/YYYY)")
                dd= int(date1[0:2])
                mm= int(date1[3:5])
                yyyy= int(date1[6:])
                date0= date(yyyy,mm,dd)
                today = date.today()
                diff = today - date0
                if diff.days<=15:
                    print("Thank you for returning the book on time, have a nice day")
                    for i in range(1,8):
                            print("")
                else:
                    fine= (diff.days-15)*5
                    print("You are", diff.days-15, "days late, kindly pay rupees", fine, "as a late return fine")
                    for i in range(1,9):
                        print("")
                cursor.execute("select title from inventory;")
                c= cursor.fetchall()
                for i in range(len(c)):
                    if bookret == c[i][0]:
                        found = "true"
                        break   
                    else:
                        found = "false"
                        
                if found == "true":
                    query1 = "SELECT quantity from inventory WHERE title = %s;"
                    cursor.execute(query1, (bookret,))
                    result = cursor.fetchall()
                    d= result[0][0]
                    e = d+1
                    query = "UPDATE inventory SET quantity = %s WHERE title= %s"
                    cursor.execute(query, (e,bookret))
                    db.commit()
                elif found == "false":
                    auth= input("Book not found in existing stock, enter author name")
                    cursor.execute("INSERT into inventory(title, author, quantity) values (%s, %s, 1);", (bookret, auth))
                    db.commit()
                    cursor.execute("select * from inventory")
                    inv = cursor.fetchall()

                    print(tabulate(inv, headers= ["Book Code", "Title", "Author", "Stock"]), '\n')
                    db.commit()
                    
                        
    elif b == '1':
        print("The available books are")
        cursor.execute("select * from inventory")
        inv = cursor.fetchall()

        print(tabulate(inv, headers= ["Book Code", "Title", "Author", "Stock"]), '\n')
            
        cursor.execute('select sum(quantity) from inventory;')
        x= cursor.fetchall()
        print("Total Inventory: ", x[0][0],"\n\n")

        print("Press 1 to search by book name \n \nPress 2 to search by author name\n\n")

        a= input("Enter your input ")
        if a == '1':
            bname= input("Enter the bookname to be searched ")
            cursor.execute("select title from inventory")
            res = cursor.fetchall()
            for i in range(len(res)):
                if res[i][0]==bname:
                    print("Found!")
                    bor = input("Would you like to borrow this book? (Y/N) ")
                    if bor == "Y":
                        cursor.execute("select quantity from inventory where title = %s", (bname,))
                        qty= cursor.fetchall()
                        new_qty= qty[0][0] - 1
                        cursor.execute("UPDATE inventory SET quantity = %s WHERE title= %s", (new_qty, bname))
                        db.commit()
                        print("All done! Be sure to return the book within 15 days to avoid late fine. Happy Reaing!" ,"\n\n\n\n\n\n\n")
                    else:
                        pass

                    
        elif a == "2":
            cursor.execute("select author from inventory group by author")
            res = cursor.fetchall()
            for i in res:
                print(i[0], "\n")
            aname = input("Enter Author name to be searched ")
            
            for i in range(len(res)):
                if res[i][0]==aname:
                    found1 = "true"
                    break
                else:
                    found1 = "false"


                    
            if found1 == "true":
                        print("\n\nFound author \n\n")
                        cursor.execute("SELECT title from inventory where author = %s", (aname,))
                        results = cursor.fetchall()
                        print("This author's available books are", "\n\n")
                        for i in results:
                            print(i[0])
                        print("")
                        bor = input("Would you like to borrow any of these books? (Y/N) ")
                        if bor == 'Y':
                            bname = input("Enter the name of the book ")
                            cursor.execute("select quantity from inventory where title = %s", (bname,))
                            qty= cursor.fetchall()
                            new_qty= qty[0][0] - 1
                            cursor.execute("UPDATE inventory SET quantity = %s WHERE title= %s", (new_qty, bname))
                            db.commit()
                            print("All done! Be sure to return the book within 15 days to avoid late fine. Happy Reaing!" ,"\n\n\n\n\n\n\n")
                        else:
                            print("\n\n\n", "Thanks for visiting","\n\n\n\n\n\n\n")
            elif found1 == "false":
                        print("\n\n\nUnfortunately, no books from", aname, "are in stock.\n\n")
                        

    else:
        print("\n\n\n", "Thanks for visiting","\n\n\n\n\n\n\n")

        

    print("\n\n\nThe available books are")
    cursor.execute("select * from inventory")
    inv = cursor.fetchall()

    print(tabulate(inv, headers= ["Book Code", "Title", "Author", "Stock"]), '\n')
            
    cursor.execute('select sum(quantity) from inventory;')
    x= cursor.fetchall()
    print("Total Inventory: ", x[0][0],"\n\n")
