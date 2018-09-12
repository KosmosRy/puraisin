// @flow
import React, { Component } from "react";
import {formatDate} from "../api";
import distanceInWordsToNow from "date-fns/distance_in_words_to_now";
import addSeconds from "date-fns/add_seconds";
import locale from "date-fns/locale/fi";

type Props = {
    realName: string,
    lastBite?: Date,
    permillage: number,
    timeTillSober: number,
    avatar: string,
    logout: Function
}

const formatLastBite = (lastBite:Date) => formatDate(lastBite, "dddd, D.M.YY [klo.] H:mm Z");
const formatTimeTillSober = (timeTillSober:number) => {
    if (timeTillSober > 0) {
        return distanceInWordsToNow(addSeconds(new Date(), timeTillSober), {locale});
    } else {
        return "-"
    }
};


class Heading extends Component<Props> {

    render() {
        const {realName, lastBite, permillage, timeTillSober, avatar, logout} = this.props;
        return (
            <div className="row">
                <div className="col-8 title">
                    <h3>Pikapuraisin</h3>
                    <h4>
                        {realName}, vanha Homo Sapiens! </h4>
                    <ul>
                        {lastBite && <li><b>Viime puraisu:</b> {formatLastBite(lastBite)}</li>}
                        {permillage > 0 && (<section>
                            <li><b>Promillemäärä:</b> {permillage.toFixed(2)} ‰</li>
                            <li><b>Selviämisarvio:</b> {formatTimeTillSober(timeTillSober)}</li>
                        </section>)}
                    </ul>
                </div>
                <div className="col-4 user-info">
                    <img src={avatar} title={realName} alt={realName}/><br/>
                    <a className="btn btn-warning btn-sm" onClick={logout}>Kirjaudu ulos</a>
                </div>
            </div>
        )
    }
}

export default Heading;