// @flow
import React, { Component } from "react";
import Heading from "./components/Heading";
import BiteForm from "./components/BiteForm";
import "./App.css";

type Props = {};

class App extends Component<Props> {
  render() {
      return (
          <div className="container-fluid main-container">
              <div className="row justify-content-xs-center">
                  <div className="main-content offset-lg-3 col-lg-6">
                      <Heading realName={"Pekka Puraisija"} currentPct={0.15} timeTillSober={80*60}
                               lastBite={new Date().getTime()}
                               avatar={"https://emoji.slack-edge.com/T02MLKTA0/trollface/8c0ac4ae98.png"}/>

                      <BiteForm/>

                      <div className="row">
                          <div className="col">
                              &copy; Apin Heristäjät {new Date().getFullYear()}
                          </div>
                      </div>

                  </div>
              </div>
          </div>
      );
  }
}

export default App;
