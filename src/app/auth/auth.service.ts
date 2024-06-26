import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";

export interface AuthResponseData {
    idToken	:string
    email:string
    refreshToken:string
    expiresIn:string	
    localId: string
    registered?: boolean
}

@Injectable({providedIn: 'root'})

export class AuthService {
    user = new Subject<User>();

    constructor(private http: HttpClient){}

    signUp(email: string, password: string){
        return this.http
        .post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCoH_SZNyEy_07ifF_bp004dnp1a0mZeuc' ,
            {
                email:email ,
                password: password,
                returnSecureToken: true
            }
        ).pipe(catchError(this.handleError),tap(resData => {
            this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn)
        })  
    )  }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>
        ('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCoH_SZNyEy_07ifF_bp004dnp1a0mZeuc' ,
            {
                email:email ,
                password: password,
                returnSecureToken: true
            }
        ).pipe(catchError(
            this.handleError
        ), tap(resData => {
            this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn)
        })  
    );
    }

    private handleAuthentication(email: string,userId: string ,token: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + +expiresIn*1000);
        const user = new User (email, userId, token,expirationDate);
        this.user.next(user);
    }


    private handleError(errorRes: HttpErrorResponse){
        let errorMessage = 'An known error ocurred';
        if(!errorRes.error || !errorRes.error.error) {
            return throwError(errorMessage);
        }
        switch (errorRes.error.error.message) {
                 case 'EMAIL_EXISTS' :
                errorMessage = 'this email is exist';
                break;
                case 'INVALID_LOGIN_CREDENTIALS':
                    errorMessage = 'Invalid Credentials ';
                    break;    
          }
          console.log(errorRes)
          return throwError(errorMessage)
          
    }
}

