// @flow
/* global SyntheticEvent */
import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass, faLocationArrow, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import type {Coords, Bite} from "../api";

// noinspection JSUnresolvedVariable
type ReactObjRef<ElementType: React.ElementType> = {
    // noinspection JSUnresolvedVariable
    current: null | React.ElementRef<ElementType>
}

type PfProps = {
    postfestum: boolean,
    pftime: string,
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
                    <div id="postfestum-minutes" className="form-group col-sm-auto input-group input-group-sm">
                        <input className="form-control" type="number" id="pf-time" name="pftime" required={true}
                               title="Postfestum-ajankohta" value={this.props.pftime} onChange={this.props.handleChange}
                               min="1" step="1"
                        />
                        <div className="input-group-append">
                            <div className="input-group-text">min sitten</div>
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
                    <div className="form-group col">
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
                                   onChange={handleChange} name="customlocation" required={true}
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
        portion: 1,
        postfestum: false,
        pftime: "",
        location: "koti",
        coordinates: {},
        content: "",
        customlocation: "",
        info: ""
    };

    portionArr = [1, 1.5, 1.2, 1.8, 1, 1.3, 2, 1, 1.1, 1.6];

    portionSelect: ReactObjRef<'select'>;
    
    constructor(props:{submitBite:Function}) {
        super(props);
        this.state = this.initState;
        this.portionSelect = React.createRef();
    }

    componentDidMount () {
        if (navigator && navigator.geolocation) {
            this.watchId = navigator.geolocation.watchPosition(pos => {
                const {accuracy, longitude, latitude, altitude, altitudeAccuracy, speed, heading} = pos.coords;
                this.setState({
                    coordinates: {
                        accuracy, longitude, latitude, altitude, altitudeAccuracy, speed, heading
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

    handleSelect = (event: SyntheticEvent<HTMLSelectElement>) => {
        const val = event.currentTarget.value;
        this.setState({
            portion: this.portionArr[parseInt(val, 10)]
        });
    };

    handleSubmit = (event: SyntheticEvent<HTMLInputElement>) => {
        this.props.submitBite(this.state);
        this.setState(this.initState);
        if (this.portionSelect.current) {
            this.portionSelect.current.value = "0";
        }
        event.preventDefault();
    };

    render () {
        const portionLabel = this.state.portion === 1 ? "annos" : "annosta";
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

                <div className="row">
                    <div className="form-group col-6 col-sm-4">
                        <label htmlFor="portion-select" className="control-label">Alkoholiannos</label>
                        <select id="portion-select" name="portion-select" className="form-control"
                                onChange={this.handleSelect} ref={this.portionSelect}
                        >
                            <option value="0">Pieni tuoppi keskaria (330 ml, 4,6 %)</option>
                            <option value="1">Iso tuoppi keskaria (500 ml, 4,6 %)</option>
                            <option value="2">Pieni tuoppi nelosta (330 ml, 5,2 %)</option>
                            <option value="3">Iso tuoppi nelosta (500 ml, 5,2 %)</option>
                            <option value="4">12 senttiä viiniä (120 ml, 12,5 %)</option>
                            <option value="5">16 senttiä viiniä (160 ml, 12,5 %)</option>
                            <option value="6">24 senttiä viiniä (240 ml, 12,5 %)</option>
                            <option value="7">8 senttiä väkevää viiniä (80 ml, 20 %)</option>
                            <option value="8">4 cl viinaa (40 ml, 40 %)</option>
                            <option value="9">4 cl 60-volttista viinaa (40 ml, 60 %)</option>
                        </select>
                    </div>
                    <div className="form-group col-5 col-sm-3 input-group input-group-sm align-self-end">
                        <input className="form-control" type="number" min="0" step="0.1" id="portion" required={true}
                               name="portion" value={this.state.portion} onChange={this.handleChange}/>
                        <div className="input-group-append">
                            <div className="input-group-text">{portionLabel}</div>
                        </div>
                    </div>
                </div>

                <PostFestum postfestum={this.state.postfestum} pftime={this.state.pftime} handleChange={this.handleChange}/>
                <Location location={this.state.location} customlocation={this.state.customlocation}
                          handleChange={this.handleChange} coordinates={this.state.coordinates}/>

                <div className="row">
                    <div className="form-group col">
                        <textarea className="form-control" placeholder="Erityisiä huomioita puraisuun liittyen.." id="info"
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