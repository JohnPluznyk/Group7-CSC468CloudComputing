from fastapi import FastAPI, Body, Request, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()
oauth_scheme = OAuth2PasswordBearer(tokenUrl="token")

# allow all origins to access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[*],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/ping")
def home():
    return "Pong"

# Login App part

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    print(form_data)
    with open("userdb.json", "r") as json_file:
        json_data = json.load(json_file)
    if json_data:
        #check if the username is present
        password = json_data.get(form_data.username)
        if not password:
            print("Wrong Username or Password. Re-enter")
            raise HTTPException(status_code=403, detail="Incorrect Username or Password")
    # TO check if the username is in the DB, and the password matches
    return{"access_token": form_data.username, "token_type":"bearer"}

@app.get("/spend/history")
def spend_history(token: str = Depends(oauth_scheme)):
    print(token)
    # Spend history logic
    with open("spendhist.json", "r") as spend_hist:
        spend_hist_data = json.load(spend_hist)
        if not spend_hist_data.get(token):
            raise HTTPException(status_code=400, detail="Username not found in the spend history DB")
    return{
        "username": token,
        "spend_hist": spend_hist_data[token]
    }

@app.get("/creditcard/history")
def credit_history(token: str = Depends(oauth_scheme)):
    print(token)
    # credit history logic
    with open("credithist.json", "r") as credit_hist:
        credit_hist_data = json.load(credit_hist)
        if not credit_hist_data.get(token):
            raise HTTPException(status_code=400, detail="Username not found in the spend history DB")
    return {
        "username": token,
        "credit_hist": credit_hist_data[token]
    }

@app.post("/transfer_money")
def transfer_money(token: str = Depends(oauth_scheme), destination_user : str = Body(...),
                   amount_to_transfer: float = Body(...)):
    print(token)
    print(destination_user)
    print(amount_to_transfer)

    with open("userbalance.json", "r") as userbalance_file:
        userbalance_data = json.load(userbalance_file)
        # Current user balance
        curr_user_bal = userbalance_data.get(token)['curr_balance']
        print(f"Current user balance is {curr_user_bal}")
        # Destination user balance
        dest_user = userbalance_data.get(destination_user)
        if not dest_user:
            raise HTTPException(status_code=400, detail="Destination User is not present in the DB, cannot transfer money!")
        dest_user_bal = dest_user['curr_balance']
        print(f"Destination User Balance = {dest_user_bal}")
        if curr_user_bal - amount_to_transfer < 0:
            raise HTTPException(status_code=400, detail="Amount to transder is greater than account balance. Cannot transfer!")
    userbalance_data[token]['curr_balance'] -= amount_to_transfer
    userbalance_data[destination_user]['curr_balance'] += amount_to_transfer
    with open("userbalance.json", "w") as userbal_write:
        json.dump(userbalance_data, userbal_write)
    return{
        "username": token,
        "message": f"Money {amount_to_transfer} successfully transferred"
    }

# Getters
@app.get("/userbalance")
def get_userbalance(token: str = Depends(oauth_scheme)):
    with open("userbalance.json", "r") as userfile:
        userbalance = json.load(userfile)
    if not userbalance.get(token):
        raise HTTPException(status_code=400, Detail="Username not present in the userbalance DB")
    return{
        "username": token,
        "current_balance": userbalance.get(token)['curr_balance']
    }
