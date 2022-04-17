// 引入自己的promise
const Promise = require("./myPromise");

let p = new Promise((resolve, reject) => {
    throw new Error("抛出异常了");
  //   reject('出错了')
  // resolve("成功了");
});

p.then(
  (res) => {
    console.log("success:" + res);
  },
  (err) => {
    console.log("fail:" + err);
  }
);
