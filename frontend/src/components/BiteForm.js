// @flow
/* global SyntheticEvent */
import * as React from "react";

type PfProps = {
    postfestum: boolean,
    pftime: number,
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
                        <input className="form-control" type="number" id="pf-time" name="pftime"
                               title="Postfestum-ajankohta" value={this.props.pftime} onChange={this.props.handleChange}/>
                        <div className="input-group-append">
                            <div className="input-group-text">tuntia sitten</div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

type LocationProps = {
    location: string,
    customlocation: string,
    handleChange: Function
}
class Location extends React.Component<LocationProps> {
    render () {
        const {location, handleChange} = this.props;
        return (
            <section>
                <div className="row">
                    <div className="col-form-legend col">Missä? <i
                        id="accuracy" className="fa fa-compass fa-spin" title="ei paikkatietoja"/>
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

type Props = {};
type State = {
    coordinates: Object,
    content: string,
    postfestum: boolean,
    pftime: number,
    location: string,
    customlocation: string,
    info: string
};

class BiteForm extends React.Component<Props, State> {
    watchId: number | null;
    
    constructor(props:Props) {
        super(props);
        this.state = {
            postfestum: false,
            location: "koti",
            coordinates: {},
            content: "",
            pftime: 1,
            customlocation: "",
            info: ""
        };
    }

    componentDidMount () {
        if (navigator && navigator.geolocation) {
            this.watchId = navigator.geolocation.watchPosition(pos => {
                this.setState({
                    coordinates: pos.coords
                });
            }, err => {
                console.error(err);
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
                               onChange={this.handleChange}
                        />
                    </div>
                </div>

                <PostFestum postfestum={this.state.postfestum} pftime={this.state.pftime} handleChange={this.handleChange}/>
                <Location location={this.state.location} customlocation={this.state.customlocation} handleChange={this.handleChange}/>

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