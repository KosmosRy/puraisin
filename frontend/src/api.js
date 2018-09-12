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
    postfestum: boolean,
    pftime: number,
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
    return await fetch("/info", {cache: "no-store"}).then(res => handleAppInfo(res));
};

const formatDate = (date:Date, pattern:string) => format(date, pattern, {locale: fiLocale});

const submitBite = async (data:Bite):Promise<AppInfo> => {
    return await fetch("/submit-data", {
        headers: new Headers({
            "CSRF-Token": csrfToken,
            "Content-Type": "application/json"
        }),
        cache: "no-store", 
        method: "POST",
        body: JSON.stringify(data)
    }).then(res => handleAppInfo(res));
};

const logout = async ():Promise<AppInfo> => {
    return await fetch(new Request("/logout"), {
        method: "DELETE",
        headers: new Headers({
            "CSRF-Token": csrfToken
        })
    }).then(res => handleAppInfo(res));
};

export {
    getInfo, formatDate, submitBite, logout
};
