import React from "react";
import ReactDOM from "react-dom";
import { Style } from "@xialvjun/create-react-style";
import { BrowserRouter, Redirect } from "react-router-dom";

import "./icomoon/style.css";
import "./index.css";
import { ADDRESS } from "./config";
import { App } from "./App";
import { zframe } from "./singleton";

// import * as serviceWorker from "./serviceWorker";
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();

window.history.pushState = (state, title, url) => {
  var relativeUrl = url.split(ADDRESS).pop();
  return zframe.cmdp("wrapperPushState", [state, title, relativeUrl]);
};

window.history.replaceState = (state, title, url) => {
  var relativeUrl = url.split(ADDRESS).pop();
  return zframe.cmdp("wrapperReplaceState", [state, title, relativeUrl]);
};

ReactDOM.render(
  <BrowserRouter basename={`/${ADDRESS}`}>
    <Style.Provider>
      <Redirect to={window.location.href.split(/[\?\&]/g)[1]} />
      <App />
    </Style.Provider>
  </BrowserRouter>,
  document.getElementById("root")
);
