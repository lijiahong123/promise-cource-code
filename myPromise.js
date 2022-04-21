// 4. promise有三个状态
const STATUS = {
  PADDING: "PADDING", // padding
  FULFILLED: "FULFILLED", // fulfilled
  REJECTED: "REJECTED", // rejected
};

/**
 *
 * @param {Object|Function} x 可能是对象或Promise
 * @param {Promise} promise2 Promise对象
 * @param {Function} resolve promise2的执行器内，成功时候执行的回调
 * @param {Function} reject promise2的执行器内，失败时候执行的回调
 */
function resolvePromise(x, promise2, resolve, reject) {
  if (x === promise2) {
    // 防止then里面return了和上一个then里面相同引用的promise,导致递归引用
    throw TypeError("不允许递归引用同一个promise对象");
  }

  // x可能是一个promise
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    let called; // 调用锁,防止多次改变状态
    try {
      let then = x.then;
      // 是promise
      if (typeof then === "function") {
        // 需要拿到x的状态，根据状态调用resolve和reject
        // 因为上面已经拿了一次x里面的then，为了避免出错，这里直接使用，不再次拿取，但是为了保证then里面的this指向，用call调用then
        // 调用返回的promise 用他的结果 作为下一次then的结果
        then.call(
          x,
          function (y) {
            if (called) return;
            called = true;
            // 递归解析成功后的值 直到他是一个promise为止
            resolvePromise(y, promise2, resolve, reject);
          },
          function (err) {
            // then的第二个参数
            if (called) return;
            called = true;
            reject(err);
          }
        );
      } else {
        if (called) return;
        called = true;
        // x是普通对象,这里为什么不用判断状态，是因为resolvePromise就是fulfilled下调用的，因此直接resolve即可
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      // 取then时候出错，进入到下一个then的第二个参数
      reject(error);
    }
  } else {
    // x就是一个普通值,直接resolve
    resolve(x);
  }
}

class Promise {
  // 2. 传入一个执行器函数
  constructor(executor) {
    // 4. 默认情况下，Promise的状态就是padding;
    this.status = STATUS.PADDING;
    this.value = undefined; // 5. 成功的原因，默认undefined，为了方便在then里面取到，所以实例上放一份
    this.reason = undefined; // 5. 失败的原因，默认undefined，为了方便在then里面取到，所以实例上放一份

    this.onFulfilledCallBack = []; // 存放成功回调的
    this.onRejectedCallBack = []; // 存放失败回调的

    // 成功回调（注意使用箭头函数，否则theis会有问题）
    const resolve = (val) => {
      //  val有可能是一个promise,这里需要注意处理
      // 若val是一个promise,此时需要调用它的then方法，递归解析
      if (val instanceof Promise) {
        return val.then(resolve, reject); // then是微任务，因此这里可以拿到reject方法
      }

      // 4. 只有padding时候才能改变状态
      if (this.status === STATUS.PADDING) {
        // 4. 调用resolve时候，将状态置位成功fulfilled
        this.status = STATUS.FULFILLED;
        // 5. 调用resoove时候，接收到成功的原因val
        this.value = val;
        // 发布：调用成功时候，将所有成功的方法执行
        this.onFulfilledCallBack.forEach((fn) => fn());
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
        // 发布： 执行失败时候，将所有失败的函数执行
        this.onRejectedCallBack.forEach((fn) => fn());
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
    // 默认处理
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (data) => data;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (err) => {
            throw err;
          }; // 这里抛出异常或调用reject才会进入下一个then的第二个参数

    // then返回一个promise才能链式调用，所以，每次调用then的时候都需要有一个全新的promise
    let promise2 = new Promise((resolve, reject) => {
      //  8. 若是当前promise的状态是成功则调用第一个参数onFulfilled
      if (this.status === STATUS.FULFILLED) {
        // setTimeout这里可以使用其他宏任务或微任务，目的是让里面的resolvePromise方法能拿到promise2
        setTimeout(() => {
          // 用户在then里面可能抛出异常
          try {
            // 这里的x就是then里面return 出来的结果
            let x = onFulfilled(this.value); // 8. 将成功的原因传递出去
            // resolve(x);
            resolvePromise(x, promise2, resolve, reject); // 用来解析x是promise的情况
          } catch (error) {
            reject(error); // 抛出异常就会走到下一个then的第二个参数
          }
        }, 0);
      }

      // 9.若是当前promise的状态是失败则调用第二个参数onRejected
      if (this.status === STATUS.REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason); // 9.将失败的原因传递出去
            // reject(x);
            resolvePromise(x, promise2, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      // 订阅模式：状态为padding时候，将方法缓存起来，等待发布..
      if (this.status === STATUS.PADDING) {
        this.onFulfilledCallBack.push(() => {
          setTimeout(() => {
            try {
              // 这里的x就是then里面return 出来的结果
              let x = onFulfilled(this.value);
              // resolve(x);
              resolvePromise(x, promise2, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        this.onRejectedCallBack.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              // reject(x);
              resolvePromise(x, promise2, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }

  // catch接收一个失败的回调
  catch(err) {
    return this.then(null, err); // 只有失败，没有成功
  }

  static resolve(value) {
    // Promise.resolve会返回一个全新的promise,所以才能then
    return new Promise((resolve, rejevt) => {
      resolve(value);
    });
  }
}

// 测试时会调用此方法
Promise.defer = Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

module.exports = Promise;
