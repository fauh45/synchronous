# Synchronous

Programatic communication system using edge computing in a 5G zone (using AWS Wavelength).

## Guide

To run the service locally do it in this order :

- `yarn install` on the root folder
- `yarn build` on the `common` folder to make sure types, and function are transpiled to js
- `yarn start` or `yarn start:pretty` on `central` first then `edge`, you can change the settings a little bit by modifying `config.ts` on each of the folder beforehand

## Services

All the region are in one VPS, with different region, with the details as follows,

### @synchronous/central

Center communication hub for all of the region. Hosted on a AWS region. There are Websocket service in port 58008 (default).

### @synchronous/edge

Edge communication server in a AWS Wavelength region, in constant communication with the central server. There are websocket service in port 3000 (default).
