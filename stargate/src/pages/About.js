import React, { Component, useState, useEffect, useRef } from "react";
import { Style } from "@xialvjun/create-react-style";

export const About = () => (
  <Style.div css={`ol{padding-inline-start:40px;}`}>
    <h1 id="what-s-stargate">What&#39;s StarGate</h1>
    <p>
      StarGate is a hash sharing site for IPFS network. And since IPFS&#39;s full name is <strong>Inter-Planetary File System</strong>, I name StarGate{" "}
      <strong>StarGate</strong>.
    </p>
    <h1 id="how-to-use">How to use</h1>
    <ol>
      <li>
        install ipfs: <a href="https://docs.ipfs.io/introduction/install/">https://docs.ipfs.io/introduction/install/</a>
      </li>
      <li>
        init an ipfs repo: <code>ipfs init</code>
      </li>
      <li>
        start an ipfs gateway daemon on the default port: <code>ipfs daemon</code>
      </li>
      <li>browse StarGate</li>
      <li>
        add a file or a directory to ipfs: <code>ipfs add big_buck_bunny.mp4</code> or <code>ipfs add -r sintel</code> and get the hash
      </li>
      <li>post the hash and the file or directory name to StarGate by click the top left upload icon</li>
      <li>browse StarGate</li>
    </ol>
    <h1 id="contact-me">Contact me</h1>
    <a href="/Mail.ZeroNetwork.bit/?to=xialvjun" target="_blank" class="active" rel="noopener noreferrer"><span>contact me</span></a>
  </Style.div>
);
