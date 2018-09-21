// @flow
import parse from "date-fns/parse";
import format from "date-fns/format";
import fiLocale from "date-fns/locale/fi";


export type LoginInfo = {
    scopes: string,
    clientId: string,
    state: string,
    redirectUri: string
}

export type AppInfo = {
    realName: string,
    burnFactor: number,
    avatar: string
}

export type UserStatus = {
    permillage: number,
    lastBite: ?Date,
    bingeStart: ?Date
}

export type Coords = {
    accuracy?:number,
    longitude?:number,
    latitude?:number,
    altitude?:number,
    altitudeAccuracy?:number
}

export type Bite = {
    coordinates: Coords,
    content: string,
    portion: number,
    postfestum: boolean,
    pftime: string,
    location: string,
    customlocation: string,
    info: string
};

let csrfToken:string = "";

class ServerError extends Error {
    response:Response;
    status:number;
    constructor(message:string, response:Response) {
        super(message);
        this.response = response;
        this.status = response.status;
        Error.captureStackTrace && Error.captureStackTrace(this, ServerError);
    }
}

const handleResponse = async (res:Response):Promise<any> => {
    if (res.ok) {
        return await res.json();
    } else {
        throw new ServerError(res.statusText, res);
    }
};

const handleUserState = async (res:Response):Promise<UserStatus> => {
    const json = await handleResponse(res);
    if (json.lastBite) {
        json.lastBite = parse(json.lastBite);
    }
    if (json.bingeStart) {
        json.bingeStart = parse(json.bingeStart);
    }
    csrfToken = json.csrf;

    return (json:UserStatus);
};

const getStatus = async ():Promise<UserStatus> => {
    return await fetch("/user-status", {cache: "no-store", credentials: "same-origin"}).then(handleUserState);
};

const getAppInfo = async ():Promise<AppInfo> => {
    return await fetch("/info", {cache: "no-store", credentials: "same-origin"}).then(handleResponse);
};

const formatDate = (date:Date, pattern:string) => format(date, pattern, {locale: fiLocale});

const submitBite = async (data:Bite):Promise<UserStatus> => {
    return await fetch("/submit-data", {
        headers: new Headers({
            "CSRF-Token": csrfToken,
            "Content-Type": "application/json"
        }),
        cache: "no-store",
        credentials: "same-origin",
        method: "POST",
        body: JSON.stringify(data)
    }).then(handleUserState);
};

const logout = async ():Promise<void> => {
    await fetch(new Request("/logout"), {
        method: "DELETE",
        credentials: "same-origin",
        headers: new Headers({
            "CSRF-Token": csrfToken
        })
    });
};

const updatedStatusListeners:Array<Function> = [];
const listenUpdatedStatus = (listener:Function) => {
  updatedStatusListeners.push(listener);
};

const setUpdatedStatus = (updated:boolean) => {
    updatedStatusListeners.forEach((fn) => fn(updated));
};

export {
    getAppInfo, getStatus, formatDate, submitBite, logout, listenUpdatedStatus, setUpdatedStatus
};
