[![Issues][issues-shield]][issues-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <!-- <a href="https://github.com/roerohan/react-vnc">
    <img src="https://project-logo.png" alt="Logo" width="80">
  </a> -->

  <h3 align="center">react-vnc</h3>

  <p align="center">
    A React Component to connect to a websockified VNC client using noVNC.
    <br />
    <a href="https://github.com/roerohan/react-vnc"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://roerohan.github.io/react-vnc/">View Demo</a>
    ·
    <a href="https://github.com/roerohan/react-vnc/issues">Report Bug</a>
    ·
    <a href="https://github.com/roerohan/react-vnc/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
  * [Demo](#demo)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contributors](#contributors-)



<!-- ABOUT THE PROJECT -->
## About The Project

[noVNC](https://github.com/novnc/noVNC) is a VNC client web application using which you can view a VNC stream directly on a browser. It uses [websockify](https://github.com/novnc/websockify) to convert the VNC stream into a websocket stream, which can be viewed on a browser. This library provides a `React` component wrapper around the `noVNC` web client.

Using this library, you can easily display a VNC stream on a page of your web application. [Here](#usage) is an example.

### Demo

A demo website using the `react-vnc` library is hosted on [https://roerohan.github.io/react-vnc/](https://roerohan.github.io/react-vnc/). The source for this application can be found in [src/App.tsx](./src/App.tsx).

<img src="./public/demo.png" alt="demo" width="800">


### Built With

* [React](https://reactjs.org)
* [noVNC](https://github.com/novnc/noVNC)



<!-- GETTING STARTED -->
## Getting Started

### Installation

To install the library, you can run the following command:

```bash
npm i react-vnc
```

### Contribution

In order to run the project locally, follow these steps:

1. Clone the repository.
```bash
git clone git@github.com:roerohan/react-vnc.git
cd react-vnc
```

2. Install the packages and submodules.
```bash
npm install
git submodule update --init --recursive
```

3. To run the sample `react-vnc` web application:
```bash
echo "REACT_APP_VNC_URL=ws://your-vnc-url.com" > .env
npm start
```

4. To build the library, make changes inside the `lib` folder, then run:
```bash
npm run build:lib
```


<!-- USAGE EXAMPLES -->
## Usage

A `VncScreen` component is exposed from the library, to which you can pass the required and optional props. For example,

```ts
import React from 'react';
import { VncScreen } from 'react-vnc';

function App() {
  return (
    <VncScreen
      url='ws://your-vnc-url.com'
      scaleViewport
      background="#000000"
      style={{
        width: '75vw',
        height: '75vh',
      }}
    />
  );
}

export default App;
```

The only `required` parameter is `url`, which must be a `ws://` or a `wss://` (websocket) URL for the library to function properly. noVNC can display only websocket URLs. All other props to `VncScreen` are optional. The following is a list (an interface) of all props along with their types.

```ts
interface Props {
  url: string;
  style?: object;
  viewOnly?: boolean;
  focusOnClick?: boolean;
  clipViewport?: boolean;
  dragViewport?: boolean;
  scaleViewport?: boolean;
  resizeSession?: boolean;
  showDotCursor?: boolean;
  background?: string;
  qualityLevel?: number;
  compressionLevel?: number;
  autoConnect?: number; // defaults to true
  retryDuration?: number; // in milliseconds
  debug?: boolean; // show logs in the console
}
```

To know more about these props, check out [API.md](https://github.com/novnc/noVNC/blob/master/docs/API.md#properties).

<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/roerohan/react-vnc/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

You are requested to follow the contribution guidelines specified in [CONTRIBUTING.md](./CONTRIBUTING.md) while contributing to the project :smile:.

<!-- LICENSE -->
## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.




<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[roerohan-url]: https://roerohan.github.io
[issues-shield]: https://img.shields.io/github/issues/roerohan/react-vnc.svg?style=flat-square
[issues-url]: https://github.com/roerohan/react-vnc/issues