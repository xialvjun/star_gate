import React, { Component, useState, useEffect, useRef } from "react";
import { Style } from "@xialvjun/create-react-style";
import css from "@xialvjun/create-react-style/macro";
import { Switch, Route, Link, Redirect, NavLink } from "react-router-dom";
import { get_path } from "@xialvjun/js-utils";
import { is } from "@xialvjun/is.js";

import { zframe } from "./singleton";
import { Modal } from "./coms/Modal";
import { About } from "./pages/About";

const css_str = css`
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-flow: column;
  align-items: stretch;
  .nav {
    flex: none;
    height: 56px;
    box-shadow: 0 0 10px -5px #333;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .user {
      margin-left: 20px;
      span {
        margin-left: 10px;
        cursor: pointer;
      }
    }
    .logo {
      margin-right: 100px;
    }
  }
  .main {
    flex: auto;
    display: flex;
  }
  .explorer {
    margin: 14px 14px 0 0;
    width: 400px;
    display: flex;
    flex-flow: column;
    align-items: center;
    form.search {
      width: 350px;
      height: 40px;
      padding: 0 10px 0 20px;
      display: flex;
      align-items: center;
      border-radius: 20px;
      box-shadow: 0 0 10px -5px #333;
      font-size: 20px;
      input {
        font-size: inherit;
        border: none;
        flex: auto;
        margin-right: 5px;
      }
    }
    ul.list {
      width: 386px;
      list-style: none;
      font-size: 12px;
      li {
        margin: 14px;
        span {
          cursor: pointer;
        }
        .row {
          margin: 5px 0;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }
        .operations {
          opacity: 0;
          span {
            margin-left: 10px;
          }
        }
        &:hover .operations {
          opacity: 1;
        }
        .name {
          font-size: 16px;
        }
      }
    }
  }
  .browser {
    margin-top: 14px;
    flex: auto;
    box-shadow: 0 0 10px -5px;
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  }
`;

export const App = () => {
  const [is_help_showing, set_is_help_showing] = useState(false);
  const [editing_hash, set_editing_hash] = useState(null);
  const [get_site_info, gsis, set_gsis] = useApi(_ => zframe.cmdp("siteInfo"), []);
  const [cert_select, certss, set_certss] = useApi(_ => zframe.cmdp("certSelect"));
  const [q, set_q] = useState("");
  const debounced_set_q = useDebounce(set_q, 500);
  const [form_text, set_form_text] = useState(q);
  const [search, searchs, set_searchs] = useApi(_ => zframe.cmdp("dbQuery", ["SELECT * FROM hashes LEFT JOIN json USING (json_id) ORDER BY updated_at DESC"]), [
    q
  ]);

  const [modify, modifys, set_modifys] = useApi(async (action, payload) => {
    if (action === "delete") {
      if (typeof payload !== "string" || payload.length === "") {
        throw "wrong data";
      }
    } else {
      const validation = is_hash(payload);
      if (!validation.is_valid) {
        throw "wrong data";
      }
    }

    const cert_user_id = get_path(gsis, "res.cert_user_id");
    const auth_address = get_path(gsis, "res.auth_address");
    if (!cert_user_id || !auth_address) {
      // No account selected, display error
      zframe.cmdp("wrapperNotification", { type: "info", message: "Please, select your account." });
      throw Error("Please, select your account.");
    }

    // This is our data file path
    const data_inner_path = "data/users/" + auth_address + "/data.json";
    const content_inner_path = "data/users/" + auth_address + "/content.json";

    try {
      // Load our current messages
      const data_text = await zframe.cmdp("fileGet", { inner_path: data_inner_path, required: false });
      let data = null;
      try {
        data = JSON.parse(data_text);
      } catch (error) {}
      data = data || {};
      data.hashes = data.hashes || {};
      if (action === "delete") {
        delete data.hashes[payload];
      } else {
        data.hashes[payload.hash] = {
          name: payload.name,
          desc: payload.desc,
          series: payload.series,
          is_dir: payload.is_dir || false,
          updated_at: Date.now()
        };
      }

      // Encode data array to utf8 json text
      const json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, "\t")));
      await zframe.cmdp("fileWrite", { inner_path: data_inner_path, content_base64: btoa(json_raw) });

      search();
      zframe.cmdp("sitePublish", { inner_path: content_inner_path, sign: true });
    } catch (error) {
      zframe.cmdp("wrapperNotification", { type: "error", message: "File write error: ${error}" });
      throw error;
    }
  });

  const filters = q.split(/\s/g);

  return (
    <Style.div css={css_str}>
      <div className="nav">
        <div className="user">
          {get_path(gsis, "res.cert_user_id") && <span onClick={_ => cert_select().then(_ => get_site_info())}>{gsis.res.cert_user_id}</span>}
          <span
            onClick={async _ => {
              if (!get_path(gsis, "res.cert_user_id")) {
                await cert_select().then(_ => get_site_info());
              }
              set_editing_hash(default_hash());
            }}
            className="icon-upload"
          />
          <NavLink to="/about">
            <span className="icon-question-circle" />
          </NavLink>
        </div>
        <h2 className="logo">StarGate</h2>
      </div>
      <div className="main">
        <div className="explorer">
          <form className="search">
            <input
              value={form_text}
              onChange={e => {
                set_form_text(e.target.value);
                debounced_set_q(e.target.value);
              }}
            />
            <span className="icon-search" />
          </form>
          <ul className="list">
            {(get_path(searchs, "res") || [])
              .filter(it =>
                filters.every(f => {
                  if (f.startsWith("cert_user_id:")) {
                    return it.cert_user_id === f.replace("cert_user_id:", "");
                  }
                  if (f.startsWith("series:")) {
                    return it.series === f.replace("series:", "");
                  }
                  return it.name.indexOf(f) > -1 || it.desc.indexOf(f) > -1;
                })
              )
              .map(it => (
                <li key={it.hash + "@" + it.cert_user_id}>
                  <div className="row">
                    <span>
                      <NavLink className="name" to={`/hashes/${it.hash}`}>
                        {it.name} {!!it.is_dir && <span className="icon-folder-open" />}
                      </NavLink>
                    </span>
                    <span
                      className="series"
                      onClick={_ => {
                        const new_q = q + ` series:${it.series} cert_user_id:${it.cert_user_id}`;
                        set_form_text(new_q);
                        set_q(new_q);
                      }}
                    >
                      {it.series}
                    </span>
                  </div>
                  <div className="row">
                    <span
                      className="cert_user_id"
                      onClick={_ => {
                        const new_q = q + ` cert_user_id:${it.cert_user_id}`;
                        set_form_text(new_q);
                        set_q(new_q);
                      }}
                    >
                      {it.cert_user_id}
                    </span>
                    <div className="operations">
                      <a href={`http://localhost:8080/ipfs/${it.hash}`} target="_blank" rel="noopener noreferrer">
                        <span className="icon-link" />
                      </a>
                      <a href={`http://localhost:8080/ipfs/${it.hash}`} download={it.name} rel="noopener noreferrer">
                        <span className="icon-download" />
                      </a>
                      <span onClick={_ => set_editing_hash(it)} className="icon-pencil" />
                    </div>
                  </div>
                  <div className="desc">{it.desc}</div>
                </li>
              ))}
          </ul>
        </div>
        <div className="browser">
          <Switch>
            <Route
              path="/hashes/:hash"
              render={({ location, history, match }) => <iframe src={`http://localhost:8080/ipfs/${match.params.hash}`} allowFullScreen />}
            />
            <Route path="/about" component={About} />
          </Switch>
        </div>
      </div>
      {editing_hash && (
        <Modal on_outside_click={_ => set_editing_hash(null)}>
          <Style.div
            css={css`
              margin: 14px;
              width: 400px;
              label > div {
                margin: 14px 0;
              }
              label input,
              textarea {
                width: 100%;
              }
              footer {
                text-align: right;
                button {
                  padding: 5px;
                  margin-left: 10px;
                }
              }
            `}
            onSubmit={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <label>
              <div>
                <div>hash</div>
                <input value={get_path(editing_hash, "hash", "")} onChange={e => set_editing_hash({ ...editing_hash, hash: e.target.value })} />
              </div>
            </label>
            <label>
              <div>
                <div>name (with extension)</div>
                <input value={get_path(editing_hash, "name", "")} onChange={e => set_editing_hash({ ...editing_hash, name: e.target.value })} />
              </div>
            </label>
            <label>
              <div>
                <div>series</div>
                <input value={get_path(editing_hash, "series", "")} onChange={e => set_editing_hash({ ...editing_hash, series: e.target.value })} />
              </div>
            </label>
            <label>
              <div>
                <div>desc</div>
                <textarea value={get_path(editing_hash, "desc", "")} onChange={e => set_editing_hash({ ...editing_hash, desc: e.target.value })} />
              </div>
            </label>
            <label onClick={_ => set_editing_hash({ ...editing_hash, is_dir: !get_path(editing_hash, "is_dir") })}>
              <span className={`icon-checkbox-${get_path(editing_hash, "is_dir") ? "" : "un"}checked`} /> This hash is a directory.
            </label>
            <footer>
              <button type="button" onClick={_ => modify("delete", editing_hash.hash)} disabled={modifys.loading}>
                delete
              </button>
              <button type="submit" onClick={_ => modify("upsert", editing_hash)} disabled={modifys.loading}>
                upsert
              </button>
            </footer>
          </Style.div>
        </Modal>
      )}
    </Style.div>
  );
};

const useApi = (api_fn, variables) => {
  const [state, set_state] = useState({ loading: !!variables, error: null, res: null });
  const api = async (...variables) => {
    set_state({ loading: true, error: null, res: state.res });
    try {
      const res = await api_fn(...variables);
      set_state({ loading: false, error: null, res });
    } catch (error) {
      set_state({ loading: false, error, res: state.res });
      throw error;
    }
  };
  useEffect(
    _ => {
      !!variables && api(...variables);
    },
    [...(variables || [])]
  );
  return [api, state, set_state];
};

const useDebounce = (fn, delay) => {
  const ref = useRef(null);
  const debounced = (...args) => {
    clearTimeout(ref.current);
    ref.current = setTimeout(() => fn(...args), delay);
  };
  return debounced;
};

const is_hash = is.object({
  hash: [is.string("hash is a not empty string"), is.length_gt(0, "hash is a not empty string")],
  name: [is.string("name is a not empty string"), is.length_gt(0, "name is a not empty string")],
  desc: is.string("desc is a string"),
  series: is.string("series is a string")
  // is_dir
});

// const Api = ({ children, api, variables }) => children(useApi(api, variables));

const default_hash = () => ({
  hash: "",
  is_dir: false,
  name: "",
  desc: "",
  series: ""
  // updated_at: 0,
});
