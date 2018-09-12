// @flow
import React, {Component} from "react";
import {getInfo, submitBite, logout} from "./api";
import type {Info, LoginInfo, AppInfo, Bite} from "./api";
import Heading from "./components/Heading";
import BiteForm from "./components/BiteForm";
import "./App.css";
import differenceInSeconds from "date-fns/difference_in_seconds";
import {Alert} from "react-bootstrap";

type Props = {};
type State = {
    appInfo: ?AppInfo,
    biteDone: boolean
}

const calcCurrentPermillage = (permillage:number, burnFactor:number, lastBite?:Date):number => {
    if (lastBite) {
        return Math.max(0, permillage - burnFactor * differenceInSeconds(new Date(), lastBite));
    }
    return 0;
};

const FrontPage = (props:{info:Info, logout: Function, submitBite:Function, biteDone:boolean}) => {
    const {realName, permillage, lastBite, burnFactor, avatar} = props.info;
    const currentPermillage = (permillage && burnFactor) ? calcCurrentPermillage(permillage, burnFactor, lastBite) : 0;
    const timeTillSober = burnFactor ? currentPermillage / burnFactor : 0;
    return (
        <section>
            <Heading realName={realName} permillage={currentPermillage}
                     timeTillSober={timeTillSober}
                     lastBite={lastBite}
                     avatar={avatar}
                     logout={props.logout}
            />

            {props.biteDone && (
                <Alert bsStyle="success">
                    <p>Jei, hyvin juotu!</p>
                </Alert>
            )}

            <BiteForm submitBite={props.submitBite}/>

            <div className="row">
                <div className="col">
                    &copy; Apin Heristäjät {new Date().getFullYear()}
                </div>
            </div>
        </section>
    );
};

const LoginPage = (props:{loginInfo:LoginInfo}) => {
    const {scopes, clientId, state, redirectUri} = props.loginInfo;
    const loginUrl = `https://slack.com/oauth/authorize?scope=${scopes}&client_id=${clientId}&state=${state}&redirect_uri=${redirectUri}`;
    return (
        <div className="row">
            <div className="col login">
                <h1>Tervetuloa!</h1>
                <h2>Ja eikun puraisemaan!</h2>
                <div className="disclaimer">kunhan annat ensiksi Slackille oikeudet pankkitiliisi ja perikuntaasi
                </div>
                <a href={loginUrl}>
                    <img src="https://platform.slack-edge.com/img/sign_in_with_slack.png"
                         srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x"
                         alt="Sign in"
                    />
                </a>
            </div>
        </div>
    )
};

class App extends Component<Props, State> {
    constructor (props:Props) {
        super(props);
        this.state = {
            appInfo: null,
            biteDone: false
        };
    }

    // noinspection JSUnresolvedVariable
    intervalId:IntervalID;

    info() {
        getInfo()
            .then((appInfo:AppInfo) => {
                this.setState({appInfo});
            })
            .catch(reason => {
                console.error(reason);
            });
    }

    submitBite = (data:Bite) => {
        submitBite(data)
            .then((appInfo:AppInfo) => {
                this.setState({
                    appInfo,
                    biteDone: true
                }, () => {
                    setTimeout(() => this.setState({biteDone: false}), 5000);
                });
            })
            .catch(reason => {
                console.error(reason);
            });
    };

    componentDidMount () {
        this.info();
        this.intervalId = setInterval(() => this.info(), 60000);
    }

    componentWillUnmount() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    logout = async () => {
        const resp = await logout();
        this.setState({
            appInfo: (resp:AppInfo)
        });
    };

    render() {
        let page;
        if (this.state.appInfo) {
            if (this.state.appInfo.info) {
                page = <FrontPage info={this.state.appInfo.info} logout={this.logout}
                                  submitBite={this.submitBite} biteDone={this.state.biteDone}/>;
            } else if (this.state.appInfo.loginInfo) {
                page = <LoginPage loginInfo={this.state.appInfo.loginInfo}/>;
            }
        } else {
            page = <div/>;
        }
        return (
            <div className="container-fluid main-container">
                <div className="row justify-content-xs-center">
                    <div className="main-content offset-lg-3 col-lg-6">
                        {page}
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
