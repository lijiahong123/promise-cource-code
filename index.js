const Promise = require("./myPromise");

// let p = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     // exector里面执行异步代码
//     resolve("ok");
//   }, 1000);
// });
// p.then(
//   (res) => {
//     return new Promise((ok, e) => {
//       e(123456);
//     });
//   },
//   (err) => {
//     console.log("fail:" + err);
//   }
// ).then(
//   (res) => {
//     console.log("成功:", res); //输出：成功: 100   （这里可以得到上一个then里面return出来的100，若上一个then没有return，则此处为undefined）
//   },
//   (err) => {
//     console.log("失败：" + err); // 输出：失败：Error: xxxxx （这里接收上一个then的抛出的异常或者上一个then第二个参数return出来的东西，若没有return，这里为undefined）
//   }
// );

// let p2 = new Promise((resolve, reject) => {
//   setTimeout(()=>{
//     resolve("okk");
//   },1000)
//   // throw Error('xxxxx')
// });
// p2.then()
//   .then()
//   .then()
//   .then(
//     (data) => {
//       console.log("data:" + data); // data:okk
//     },
//     (err) => {
//       console.log("err:" + err);
//   });

// Promise.resolve(p2).then(r=>{
//   console.log(r);
// },err=>{
//   console.log("err："+err);
// })

Promise.all('1234').then(res=>{
  console.log(res);
}).catch(err=>{
  console.log(err);
})
