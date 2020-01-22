[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services)

# Master

## NPM scripts

- `npm run dev`: Start development mode (load all services locally with hot-reload & REPL)
- `npm run start`: Start production mode (set `SERVICES` env variable to load certain services)
- `npm run cli`: Start a CLI and connect to production. Don't forget to set production namespace with `--ns` argument in script
- `npm run lint`: Run ESLint
- `npm run dc:up`: Start the stack with Docker Compose
- `npm run dc:down`: Stop the stack with Docker Compose

## Testing

All up:

Summary report @ 23:30:32(+0100) 2020-01-21
  Scenarios launched:  1200
  Scenarios completed: 1200
  Requests completed:  4800
  RPS sent: 39.87
  Request latency:
    min: 16
    max: 750.6
    median: 25.1
    p95: 72.9
    p99: 171.5
  Scenario counts:
    0: 1200 (100%)
  Codes:
    200: 4800

When node turned off:
Summary report @ 23:35:05(+0100) 2020-01-21
  Scenarios launched:  1200
  Scenarios completed: 1200
  Requests completed:  4800
  RPS sent: 39.87
  Request latency:
    min: 16
    max: 10130
    median: 103.1
    p95: 9017.2
    p99: 9033.8
  Scenario counts:
    0: 1200 (100%)
  Codes:
    200: 3279
    404: 1121
    502: 400

After some time (note that exactly 1/4 of requests are failing -> these are all that have hit the mt-api-gateway at the "dead" node):
Summary report @ 23:37:19(+0100) 2020-01-21
  Scenarios launched:  1200
  Scenarios completed: 1200
  Requests completed:  4800
  RPS sent: 39.87
  Request latency:
    min: 16.1
    max: 548.8
    median: 33.7
    p95: 131.4
    p99: 210.1
  Scenario counts:
    0: 1200 (100%)
  Codes:
    200: 3600
    404: 1200
