// @flow
import parse from "date-fns/parse";
import format from "date-fns/format";
import fiLocale from "date-fns/locale/fi";


export type Info = {
    realName: string,
    permillage: number,
    lastBite?: Date,
    burnFactor: number,
    avatar: string
}

export type LoginInfo = {
    scopes: string,
    clientId: string,
    state: string,
    redirectUri: string
}

export type AppInfo = {
    info?: Info,
    loginInfo?: LoginInfo
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
    portion: string,
    postfestum: boolean,
    pftime: string,
    location: string,
    customlocation: string,
    info: string
};

let csrfToken:string = "";

const handleAppInfo = async (res:Response):Promise<AppInfo> => {
    const json = await res.json();
    if (json.info && json.info.lastBite) {
        json.info.lastBite = parse(json.info.lastBite);
    }
    csrfToken = json.info ? json.info.csrf : "";

    return (json:AppInfo);
};

const getInfo = async ():Promise<AppInfo> => {
    return await fetch("/info", {cache: "no-store", credentials: "same-origin"}).then(res => handleAppInfo(res));
};

const formatDate = (date:Date, pattern:string) => format(date, pattern, {locale: fiLocale});

const submitBite = async (data:Bite):Promise<AppInfo> => {
    return await fetch("/submit-data", {
        headers: new Headers({
            "CSRF-Token": csrfToken,
            "Content-Type": "application/json"
        }),
        cache: "no-store",
        credentials: "same-origin",
        method: "POST",
        body: JSON.stringify(data)
    }).then(res => handleAppInfo(res));
};

const logout = async ():Promise<AppInfo> => {
    return await fetch(new Request("/logout"), {
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
    getInfo, formatDate, submitBite, logout, listenUpdatedStatus, setUpdatedStatus
};
