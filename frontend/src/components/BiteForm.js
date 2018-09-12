// @flow
/* global SyntheticEvent */
import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass, faLocationArrow, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import type {Coords, Bite} from "../api";

type PfProps = {
    postfestum: boolean,
    pftime: number | null,
    handleChange: Function
}
class PostFestum extends React.Component<PfProps> {
    render () {
        return (
            <div className="row justify-content-start">
                <div className="form-group col-xs-auto">
                    <div className="form-check form-check-inline">
                        <label className="form-check-label">
                            <input type="checkbox" className="form-check-input" id="postfestum"
                                   name="postfestum" checked={this.props.postfestum}
                                   onChange={this.props.handleChange}
                            /> Postfestum
                        </label>
                    </div>
                </div>
                {this.props.postfestum && (
                    <div id="postfestum-hours" className="form-group col-sm-auto input-group input-group-sm">
                        <input className="form-control" type="number" id="pf-time" name="pftime" required={true}
                               title="Postfestum-ajankohta" value={this.props.pftime} onChange={this.props.handleChange}
                        />
                        <div className="input-group-append">
                            <div className="input-group-text">tuntia sitten</div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

function toDM(degrees:number, pos, neg) {
    let positive = true;
    if (degrees < 0) {
        positive = false;
        degrees = -degrees;
    }

    let degreesFull = Math.floor(degrees);

    let minutes = 60 * (degrees - degreesFull);
    let minutesRounded = minutes.toFixed(3);

    if (minutesRounded === 60) {
        minutesRounded = "0.000";
        degreesFull += 1;
    }

    if (degreesFull < 10) {
        degreesFull = "0" + degreesFull;
    }

    if (parseInt(minutesRounded, 10) < 10) {
        minutesRounded = "0" + minutesRounded;
    }

    return (degreesFull + "°" + minutesRounded + "'" + (positive ? pos : neg));
}

function formatDM(coords:Coords) {
    if (coords.accuracy && !isNaN(coords.accuracy)) {
        const c = ((coords:any):Coordinates);
        return `${toDM(c.latitude, "N", "S")} ${toDM(c.longitude, "E", "W")} (±${c.accuracy.toFixed(0)}m)`;
    } else {
        return "ei paikkatietoja";
    }
}

type LocationProps = {
    location: string,
    coordinates: Coords,
    customlocation: string,
    handleChange: Function
}
class Location extends React.Component<LocationProps> {
    render () {
        const {location, handleChange} = this.props;

        const { accuracy } = this.props.coordinates;
        const locationIndicator = {
            icon: faCompass,
            className: "compass",
            spin: true
        };


        if (accuracy !== undefined) {
            locationIndicator.spin = false;
            if (isNaN(accuracy)) {
                locationIndicator.icon = faExclamationTriangle;
                locationIndicator.className = "red";
            } else {
                locationIndicator.icon = faLocationArrow;
                if (accuracy <= 10) {
                    locationIndicator.className = "green";
                } else if (accuracy <= 50) {
                    locationIndicator.className = "yellow";
                } else if (accuracy <= 1000) {
                    locationIndicator.className = "orange";
                } else {
                    locationIndicator.className = "red";
                }
            }
        }

        return (
            <section>
                <div className="row">
                    <div className="col-form-legend col">Missä?
                        <i title={formatDM(this.props.coordinates)}> <FontAwesomeIcon icon={locationIndicator.icon}
                                                                                      spin={locationIndicator.spin}
                                                                                      className={locationIndicator.className}/></i>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="form-check form-check-inline">
                            <label className="form-check-label">
                                <input type="radio" className="form-check-input location-input" name="location"
                                       value="koti" checked={location === "koti"} onChange={handleChange}/> Koti
                            </label>
                        </div>

                        <div className="form-check form-check-inline">
                            <label className="form-check-label">
                                <input type="radio" className="form-check-input location-input" name="location"
                                       value="työ" checked={location === "työ"} onChange={handleChange}/> Työ
                            </label>
                        </div>

                        <div className="form-check form-check-inline">
                            <label className="form-check-label">
                                <input type="radio" className="form-check-input location-input" name="location"
                                       value="baari" checked={location === "baari"} onChange={handleChange}/> Baari
                            </label>
                        </div>

                        <div className="form-check form-check-inline">
                            <label className="form-check-label">
                                <input type="radio" className="form-check-input location-input" name="location"
                                       id="customlocation" value="else" checked={location === "else"} onChange={handleChange}/> Muu
                            </label>
                        </div>
                    </div>
                </div>

                {location === "else" && (
                    <div className="row">
                        <div className="form-group col">
                            <input className="form-control" type="text" id="customlocation-input"
                                   placeholder="Missäs sitten?" value={this.props.customlocation}
                                   onChange={handleChange} name="customlocation"
                            />
                        </div>
                    </div>
                )}
            </section>
        );
    }
}

class BiteForm extends React.Component<{submitBite:Function}, Bite> {
    watchId: number | null;
    initState = {
        postfestum: false,
        location: "koti",
        coordinates: {},
        pftime: null,
        content: "",
        customlocation: "",
        info: ""
    };
    
    constructor(props:{submitBite:Function}) {
        super(props);
        this.state = this.initState;
    }

    componentDidMount () {
        if (navigator && navigator.geolocation) {
            this.watchId = navigator.geolocation.watchPosition(pos => {
                const {accuracy, longitude, latitude, altitude, altitudeAccuracy} = pos.coords;
                this.setState({
                    coordinates: {
                        accuracy, longitude, latitude, altitude, altitudeAccuracy
                    }
                });
            }, err => {
                console.error(err);
                this.setState({coordinates: {accuracy: NaN}});
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            })
        }
    }

    componentWillUnmount () {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        const value = target.type === "checkbox" ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    };

    handleSubmit = (event: SyntheticEvent<HTMLInputElement>) => {
        console.log(this.state);
        this.props.submitBite(this.state);
        this.setState(this.initState);
        event.preventDefault();
    };

    render () {
        return (
            <form onSubmit={this.handleSubmit}>
                <input type="hidden" name="coordinates" id="coordinates" value={JSON.stringify(this.state.coordinates)}/>

                <div className="row">
                    <div className="form-group col">
                        <input className="form-control" placeholder="Mitäs ajattelit puraista?"
                               type="text" id="content" name="content" value={this.state.content}
                               onChange={this.handleChange} required={true}
                        />
                    </div>
                </div>

                <PostFestum postfestum={this.state.postfestum} pftime={this.state.pftime} handleChange={this.handleChange}/>
                <Location location={this.state.location} customlocation={this.state.customlocation}
                          handleChange={this.handleChange} coordinates={this.state.coordinates}/>

                <div className="row">
                    <div className="form-group col">
                        <textarea className="form-control" placeholder="Lorem ipsum..." id="info"
                                  name="info" value={this.state.info} onChange={this.handleChange}/>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group col">
                        <button type="submit" className="btn btn-success">Puraise!</button>
                    </div>
                </div>
            </form>
        );
    }
}

export default BiteForm;