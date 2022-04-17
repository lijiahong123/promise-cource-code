// 4. promise有三个状态
const STATUS = {
  PADDING: "PADDING", // padding
  FULFILLED: "FULFILLED", // fulfilled
  REJECTED: "REJECTED", // rejected
};

class Promise {
  // 2. 传入一个执行器函数
  constructor(executor) {
    // 4. 默认情况下，Promise的状态就是padding;
    this.status = STATUS.PADDING;
    this.value = undefined; // 5. 成功的原因，默认undefined，为了方便在then里面取到，所以实例上放一份
    this.reason = undefined; // 5. 失败的原因，默认undefined，为了方便在then里面取到，所以实例上放一份

    // 成功回调（注意使用箭头函数，否则theis会有问题）
    const resolve = (val) => {
      // 4. 只有padding时候才能改变状态
      if (this.status === STATUS.PADDING) {
        // 4. 调用resolve时候，将状态置位成功fulfilled
        this.status = STATUS.FULFILLED;
        // 5. 调用resoove时候，接收到成功的原因val
        this.value = val;
      }
    };

    // 失败回调（注意使用箭头函数，否则theis会有问题）
    const reject = (reason) => {
      // 4. 只有padding时候才能改变状态
      if (this.status === STATUS.PADDING) {
        // 4. 调用reject时，将promise置位失败，rejected
        this.status = STATUS.REJECTED;
        // 5. 调用reject时候， 接收到失败原因reason;
        this.reason = reason;
      }
    };

    // 6.可以在执行器函数内抛出异常，这里可以用try catch来捕获异常
    try {
      // 2. 执行器函数默认就会执行，
      // 3.执行器函数接收个参数，分别是resolve,reject，都是函数
      executor(resolve, reject);
    } catch (e) {
      // 6. 捕获到异常会导致promise失败
      reject(e);
    }
  }

  // 7. then是promise的实例方法，有两个参数，onFulfilled,onRejected
  then(onFulfilled, onRejected) {
    //  8. 若是当前promise的状态是成功则调用第一个参数onFulfilled
    if (this.status === STATUS.FULFILLED) {
      onFulfilled(this.value); // 8. 将成功的原因传递出去
    }
    // 9.若是当前promise的状态是失败则调用第二个参数onRejected
    if (this.status === STATUS.REJECTED) {
      onRejected(this.reason); // 9.将失败的原因传递出去
    }
  }
}

module.exports = Promise;