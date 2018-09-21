// @flow
import React, { Component } from "react";
import {formatDate} from "../api";
import distanceInWordsToNow from "date-fns/distance_in_words_to_now";
import addSeconds from "date-fns/add_seconds";
import locale from "date-fns/locale/fi";

type Props = {
    realName: string,
    lastBite: ?Date,
    bingeStart: ?Date,
    permillage: number,
    timeTillSober: number,
    avatar: string,
    logout: Function
}

const formatLastBite = (lastBite:Date) => formatDate(lastBite, "ddd, D.M.YY [klo.] H:mm Z");
const formatTimeTillSober = (timeTillSober:number) => {
    if (timeTillSober > 0) {
        return distanceInWordsToNow(addSeconds(new Date(), timeTillSober), {locale});
    } else {
        return "-";
    }
};
const formatTimeToNow = (from:?Date) => {
    if (from) {
        return distanceInWordsToNow(from, {locale});
    } else {
        return "-";
    }
};


class Heading extends Component<Props> {

    render() {
        const {realName, lastBite, permillage, timeTillSober, avatar, logout, bingeStart} = this.props;
        return (
            <section className="heading">
                <div className="row">
                    <div className="col-8 title">
                        <h3>Pikapuraisin</h3>
                        <h4>{realName}, vanha Homo Sapiens!</h4>
                    </div>
                    <div className="col-4 user-info">
                        <img src={avatar} title={realName} alt={realName}/><br/>
                        <a className="btn btn-warning btn-sm" onClick={logout}>Kirjaudu ulos</a>
                    </div>
                </div>
                <div className="row">
                    <div className="col title">
                        <ul>
                            {lastBite && <li><b>Viime puraisu:</b> {formatLastBite(lastBite)}</li>}
                            {permillage > 0 && (<section>
                                <li><b>Promillemäärä:</b> {permillage.toFixed(2).replace(".", ",")}{"\u00A0"}‰</li>
                                <li><b>Rännin pituus:</b> {formatTimeToNow(bingeStart)}</li>
                                <li><b>Selviämisarvio:</b> {formatTimeTillSober(timeTillSober)}</li>
                            </section>)}
                        </ul>
                    </div>
                </div>
            </section>
        )
    }
}

export default Heading;