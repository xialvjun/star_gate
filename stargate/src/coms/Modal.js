import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Style } from "@xialvjun/create-react-style";
import css from "@xialvjun/create-react-style/macro";
import { Switch, Route, Link, Redirect } from "react-router-dom";
import { Element, init_api, init_state, init_value } from "@xialvjun/react-element";
import { get_path } from "@xialvjun/js-utils";

const stop_propagation = e => e.stopPropagation();

export const Modal = ({ children, on_outside_click }) =>
  ReactDOM.createPortal(
    <Style.div
      css={css`
        position: fixed;
        top: 0;
        width: 100vw;
        height: 100vh;
        background: #000a;
        overflow: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        > div {
          background: #fff;
        }
      `}
      onClick={_ => on_outside_click && on_outside_click()}
    >
      <div onClick={stop_propagation}>{children}</div>
    </Style.div>,
    document.body
  );
