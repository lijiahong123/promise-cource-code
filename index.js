const Promise = require("./myPromise");

let p = new Promise((resolve, reject) => {
  setTimeout(() => {  // exector里面执行异步代码
    resolve("ok");
  }, 1000);
});

p.then(
  (res) => {
    console.log("success:" + res); // 过2秒后输出  success: ok
  },
  (err) => {
    console.log("fail:" + err);
  }
);

p.then(
  (res) => {
    console.log("resolve: " + res); // 过2秒后输出  resolve: ok
  },
  (err) => {
    console.log("shibai: " + err);
  }
);