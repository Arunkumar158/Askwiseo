// Simple k6 load test for Askwiseo API
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // ramp-up to 10 users
    { duration: '1m', target: 10 },  // stay at 10 users
    { duration: '30s', target: 0 }, // ramp-down
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  const res = http.get(`${BASE_URL}/healthz`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
