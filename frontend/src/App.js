// @flow
import React, {Component} from "react";
import {getAppInfo, getStatus, submitBite, logout, listenUpdatedStatus} from "./api";
import type {UserStatus, LoginInfo, AppInfo, Bite} from "./api";
import Heading from "./components/Heading";
import BiteForm from "./components/BiteForm";
import "./App.css";
import differenceInSeconds from "date-fns/difference_in_seconds";
import {Alert} from "react-bootstrap";
import { CSSTransitionGroup } from "react-transition-group";

type Props = {};
type State = {
    loginInfo?: LoginInfo,
    appInfo: ?AppInfo,
    appUpdated: boolean
}
type FpProps = {
    info:AppInfo,
    logout:Function
}

type FpState = {
    permillage: number,
    lastBite: ?Date,
    biteDone:boolean,
    lastContent:string,
    error?:string
};

const calcCurrentPermillage = (permillage:number, burnFactor:number, lastBite:?Date):number => {
    if (lastBite) {
        return Math.max(0, permillage - burnFactor * differenceInSeconds(new Date(), lastBite));
    }
    return 0;
};

class FrontPage extends Component<FpProps, FpState> {
    constructor(props) {
        super(props);
        this.state = {
            permillage: 0,
            lastBite: null,
            biteDone: false,
            lastContent: ""
        };
    }

    submitBite = (data:Bite) => {
        submitBite(data)
            .then((userStatus:UserStatus) => {
                this.setState({
                    permillage: userStatus.permillage,
                    lastBite: userStatus.lastBite,
                    biteDone: true,
                    lastContent: data.content,
                    error: undefined
                }, () => {
                    setTimeout(() => this.setState({biteDone: false}), 5000);
                });
            })
            .catch(reason => {
                console.error(reason);
                this.setState({
                    permillage: 0,
                    lastBite: null,
                    error: reason.message
                })
            });
    };

    // noinspection JSUnresolvedVariable
    intervalId:IntervalID;

    info() {
        getStatus()
            .then((userStatus:UserStatus) => {
                this.setState({
                    permillage: userStatus.permillage,
                    lastBite: userStatus.lastBite,
                    error: undefined
                });
            })
            .catch(reason => {
                console.error(reason);
                this.setState({
                    permillage: 0,
                    lastBite: null,
                    error: reason.message
                })
            });
    }

    componentDidCatch(error:Error) {
        console.error("Cought " + error.message);
    }

    componentDidMount () {
        this.info();
        this.intervalId = setInterval(() => this.info(), 60000);
    }

    componentWillUnmount() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    render() {
        const {realName, burnFactor, avatar} = this.props.info;
        const {permillage, lastBite} = this.state;
        const currentPermillage = (permillage && burnFactor) ? calcCurrentPermillage(permillage, burnFactor, lastBite) : 0;
        const timeTillSober = burnFactor ? currentPermillage / burnFactor : 0;
        return (
            <section>
                <Heading realName={realName} permillage={currentPermillage}
                         timeTillSober={timeTillSober}
                         lastBite={lastBite}
                         avatar={avatar}
                         logout={this.props.logout}
                />

                <CSSTransitionGroup transitionName="bitesuccess"
                                    transitionEnterTimeout={1}
                                    transitionLeaveTimeout={1000}>
                    {this.state.biteDone && (
                        <Alert bsStyle="success">
                            <div>Toppen! Raportoit puraisun "{this.state.lastContent}", jonka juotuasi olet noin {currentPermillage.toFixed(2)}{" "}
                                promillen humalassa.<br/>{currentPermillage > 0.5 && <strong>Muista jättää ajaminen muille!</strong>}</div>
                        </Alert>
                    )}
                </CSSTransitionGroup>

                {this.state.error && (
                    <Alert bsStyle="danger">
                        <div>Viduiks män, syy: "{this.state.error}". <a href="/">Verestä sivu</a> ja kokeile uudestaan, tai jotain</div>
                    </Alert>
                )}

                <BiteForm submitBite={this.submitBite}/>

                <div className="row">
                    <div className="col">
                        &copy; Apin Heristäjät {new Date().getFullYear()}
                    </div>
                </div>
            </section>
        );
    }
}

class LoginPage extends Component<{loginInfo:LoginInfo}> {
    render() {
        const {scopes, clientId, state, redirectUri} = this.props.loginInfo;
        const loginUrl = `https://slack.com/oauth/authorize?scope=${scopes}&client_id=${clientId}&state=${state}&redirect_uri=${redirectUri}`;
        return (
            <div className="row">
                <div className="col login">
                    <h1>Tervetuloa!</h1>
                    <h2>Ja eikun puraisemaan!</h2>
                    <div className="disclaimer">kunhan annat ensiksi Slackille oikeudet pankkitiliisi ja
                        perikuntaasi
                    </div>
                    <a href={loginUrl}>
                        <img src="https://platform.slack-edge.com/img/sign_in_with_slack.png"
                             srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x"
                             alt="Sign in"
                        />
                    </a>
                </div>
            </div>
        );
    }
}


class App extends Component<Props, State> {
    constructor (props:Props) {
        super(props);
        this.state = {
            appInfo: null,
            appUpdated: false
        };
    }

    init = () => {
        getAppInfo()
            .then(appInfo => this.setState({appInfo}))
            .catch(err => {
                if (err.status === 401) {
                    err.response.json().then(loginInfo => this.setState({loginInfo}))
                } else {
                    this.setState({
                        appInfo: null,
                        appUpdated: false,
                        loginInfo: undefined
                    })
                }
            });
    };

    componentDidMount () {
        listenUpdatedStatus((appUpdated:boolean) => this.setState({appUpdated}));
        this.init();
    }

    logout = async () => {
        await logout();
        this.init();
    };

    render() {
        let page;
        if (this.state.loginInfo) {
            page = <LoginPage loginInfo={this.state.loginInfo}/>;
        } else  if (this.state.appInfo) {
            page = <FrontPage info={this.state.appInfo} logout={this.logout}/>;
        } else {
            page = <div/>;
        }

        return (
            <div>
                {this.state.appUpdated && (
                    <Alert bsStyle="warning">
                        <strong>Puraisin on päivittynyt. <a href="/">Päivity</a> sinäkin!</strong>
                    </Alert>
                )}
                <div className="container-fluid main-container">
                    <div className="row justify-content-xs-center">
                        <div className="main-content offset-lg-3 col-lg-6">
                            {page}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
