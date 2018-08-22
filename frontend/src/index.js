import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import moment from "moment";
import "moment/locale/fi";

moment.locale("fi");

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
