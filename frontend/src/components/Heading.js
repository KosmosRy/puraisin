// @flow
import React, { Component } from "react";
import moment from "moment";

type Props = {
    realName: string,
    lastBite?: number,
    currentPct: number,
    timeTillSober?: number,
    avatar: string
}

const formatLastBite = (lastBite:number) => moment(lastBite).format("dddd, D.M.Y [klo.] H:mm Z");
const formatTimeTillSober = (timeTillSober?:number) => {
    if (timeTillSober) {
        return `${Math.floor(timeTillSober / 3600)} h ${Math.floor((timeTillSober % 3600) / 60)} min`;
    } else {
        return "-"
    }
};


class Heading extends Component<Props> {

    render() {
        const {realName, lastBite, currentPct, timeTillSober, avatar} = this.props;
        return (
            <div className="row">
                <div className="col-8 title">
                    <h3>Pikapuraisin</h3>
                    <h4>
                        {realName}, vanha Homo Sapiens! </h4>
                    <ul>
                        {lastBite && <li><b>Viime puraisu:</b> {formatLastBite(lastBite)}</li>}
                        {currentPct > 0 && (<section>
                            <li><b>Promillemäärä:</b> {currentPct} ‰</li>
                            <li><b>Selviämisarvio:</b> {formatTimeTillSober(timeTillSober)}</li>
                        </section>)}
                    </ul>
                </div>
                <div className="col-4 user-info">
                    <img src={avatar} title={realName}/><br/>
                    <a className="btn btn-warning btn-sm" href="/logout">Kirjaudu ulos</a>
                </div>
            </div>
        )
    }
}

export default Heading;