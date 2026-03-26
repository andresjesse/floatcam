# Floatcam Fork

**Note**: this project was forked from [Floatcam](https://github.com/theterminalguy/floatcam). I've added some fixes and features for my own needs. If you like this project, I suggest you to support the original creator: theterminalguy.

You can check the post-fork [CHANGELOG](CHANGELOG.md).

--

**Floatcam** is a simple, lightweight, and easy-to-use camera app that can be used alongside any screen recorder. It floats on top of other apps, so you can easily record your screen and your face at the same time.

It is perfect for recording tutorials, gameplay, or anything else you want to share with the world. The floating camera preview can be moved around while recording. You don't have to worry about the camera getting in the way of your recording or making such adjustment post-production.

## Installation

Check [releases](https://github.com/andresjesse/floatcam/releases).

## Building from source

If you want to build Floatcam from source, you can do so by cloning the repository and use electron-forge to build it.

## Developing locally

First ensure you have the correct version of Node.js installed. If you are using [nvm](https://github.com/nvm-sh/nvm) you can run `nvm use` to switch to the correct version.

Next, clone the repository and install the dependencies.

```bash
git clone https://github.com/theterminalguy/floatcam.git && cd floatcam && yarn install
```

To start the app, you'd need to run `yarn build && yarn start` and `yarn desktop` in two separate terminals.
