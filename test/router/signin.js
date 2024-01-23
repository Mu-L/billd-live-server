/* eslint-disable no-console */
const autocannon = require('autocannon');

function formatMemorySize(val, num = 2) {
  // bit:"比特"或"位",1byte=8bit
  const oneByte = 1;
  const oneKb = oneByte * 1024;
  const oneMb = oneKb * 1024;
  const oneGb = oneMb * 1024;
  const oneTb = oneGb * 1024;
  const format = (v) => v.toFixed(num);
  if (val < oneKb) {
    return `${format(val / oneByte)}byte`;
  }
  if (val < oneMb) {
    return `${format(val / oneKb)}KB`;
  }
  if (val < oneGb) {
    return `${format(val / oneMb)}MB`;
  }
  if (val < oneTb) {
    return `${format(val / oneGb)}GB`;
  }
  return `${format(val / oneTb)}TB`;
}

function objectToUrlParams(obj) {
  const params = new URLSearchParams();

  Object.keys(obj).forEach((key) => {
    params.append(key, obj[key]);
  });

  return params.toString();
}

const baseUrl = 'http://localhost:4300';
// const baseUrl = 'https://api.gatsby1680.com';
const codeMap = {
  '1xx': '1xx',
  '2xx': '2xx',
  '3xx': '3xx',
  '4xx': '4xx',
  '5xx': '5xx',
};
const map = {
  total: '总数',
  min: '最低值',
  max: '最高值',
  average: '平均值',
  stddev: '标准差',
};

async function foo() {
  const result = await autocannon({
    url: `${baseUrl}/signin/today_is_signin?live_room_id=7`,
    method: 'GET',
    connections: 10, // 并发连接数。可选默认值：10
    pipelining: 1, // 每个连接的管道请求数。当大于 1 时将导致ClientAPI 抛出异常。可选默认值：1
    duration: 5, // 运行的秒数。可以是时间字符串。可选默认值：10
    headers: {
      Authorization: `
      Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mbyI6eyJpZCI6MjE1LCJ1c2VybmFtZSI6Iua4uOWuoi1FdThwZUVsUCJ9LCJleHAiOjE3MDg1NzIxNTIsImlhdCI6MTcwNTk4MDE1Mn0.9HfR_CbjsRMKK88vONK8q7Rb-OnC48n9DAREkabZtos`,
    },
  });
  // const result = await autocannon({
  //   url: `${baseUrl}/area/list`,
  //   method: 'GET',
  //   connections: 10, // 并发连接数。可选默认值：10
  //   pipelining: 1, // 每个连接的管道请求数。当大于 1 时将导致ClientAPI 抛出异常。可选默认值：1
  //   duration: 5, // 运行的秒数。可以是时间字符串。可选默认值：10
  // });
  console.log(result);
  if (result) {
    let codeStr = '状态码:';
    let latencyStr = '响应延迟:';
    let requestsStr = '每秒发送的请求数:';
    let throughputStr = '每秒响应数据吞吐量:';

    Object.keys(result).forEach((key) => {
      if (Object.keys(codeMap).includes(key)) {
        const tmp = `${codeMap[key]}:${Math.floor(result[key])}; `;
        codeStr += tmp;
      }
    });
    Object.keys(result.latency).forEach((key) => {
      if (Object.keys(map).includes(key)) {
        const tmp = `${map[key]}:${Math.floor(result.latency[key])}ms; `;
        latencyStr += tmp;
      }
    });
    Object.keys(result.requests).forEach((key) => {
      if (Object.keys(map).includes(key)) {
        const tmp = `${map[key]}:${Math.floor(result.requests[key])}; `;
        requestsStr += tmp;
      }
    });
    Object.keys(result.throughput).forEach((key) => {
      if (Object.keys(map).includes(key)) {
        const tmp = `${map[key]}:${formatMemorySize(result.throughput[key])}; `;
        throughputStr += tmp;
      }
    });
    console.log(`路径:${result.url}; 压测持续时间:${result.duration}秒`);
    console.log();
    console.log(codeStr);
    console.log();
    console.log(latencyStr);
    console.log();
    console.log(throughputStr);
    console.log();
    console.log(requestsStr);
  }
}
foo();
