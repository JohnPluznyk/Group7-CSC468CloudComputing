from fastapi import FastAPI, Body, Request, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import json

app = FastAPI();
oauth_scheme = OAuth2PasswordBearer(tokenURL="token")

@app.get("/ping")
def home():
    return "Pong"


#Login App Part

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    print(form_data)
    with open("userdb.json", "r") as json_file:
        json_data = json.load(json_file)
    if json_data:
        #check if the username is present
        password = json_data.get(form_data.username)
        if not password:
            print("Wrong username or password. Re enter")
            raise HTTPException(status_code=400, detail = "Incorrect Username or Password")
    # to check if the username is in the DB and the password matches
    return {"access token": form_data.username, "token type": "bearer"}



@app.get("/spend/history")
def spend_history(token: str = Depends(oauth_scheme)):
    print(token)
    #Spend history logic
    with open("spendhistory.json", "r") as spend_history:
        spend_history_data = json.load(spend_history)
        if not spend_history_data.get(token):
            raise HTTPException(status_code=400, detail= "username not found in the spend history DB")
    return {
        "username": token,
        "spend_histroy": spend_history_data[token]
    }


@app.get("/creditcard/history")
def credit_history(token: str = Depends(oauth_scheme)):
    print(token)
    #Spend history logic
    with open("credithistory.json", "r") as credit_history:
        credit_history_data = json.load(credit_history)
        if not credit_history_data.get(token):
            raise HTTPException(status_code=400, detail="username not found in the credit histroy DB")
    return {
        "username": token,
        "credit_history": credit_history_data[token]
    } 