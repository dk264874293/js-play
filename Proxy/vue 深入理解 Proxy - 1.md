---
sidebar: false
prev: false
next: false
---

<pdf-page>
<Page>

# vue 深入理解 Proxy

</Page>

Proxy 提供了强大功能的同时也让代码变得不可预测性， 所以 Proxy 是针对于底层框架设计的 api。

<Page>

## defineProperty 的区别

defineProperty 中在设置一个不存在的值并不会出发响应的 getter、setter 的函数

Proxy 即使设置不存在的属性也会正常的触发相应的 get、set。
除了 get、set 外还提供了大量的内置函数对对象的操作都提供了一个可以拦截并改变他行为的 api 详见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 。

<Col>

```js
let obj = {
  a: 1,
  b: 2,
};
let po = new Proxy(obj, {
  set(obj, prop, val) {
    console.log(obj, prop, val);
  },
  get(obj, prop) {
    console.log(obj, prop);
  },
});
```

</Col>
以上代码就是Proxy最简单的应用。在修改原始的obj时并不会执行相应的钩子函数，只有在操作被代理的po对象时才会真正有效

## 使用 Proxy 来模拟 reactive

### reactive 简单封装

对 Proxy 进行了简单的封装实现了最简单的 po 对 object 的代码， 如监听其他数据是就可以直接调用 reactive 函数来创建 proxy 代理对象.如果需要实现一个完全的代理需要将 proxy 的所有 hook 都要进行考虑。

<Col>

```js
let obj = {
  a: 1,
  b: 2,
};
let po = reactive(obj);

function reactive(object) {
  return new Proxy(object, {
    set(obj, prop, val) {
      obj[prop] = val;
      console.log(obj, prop, val);
      return obj[prop];
    },
    get(obj, prop) {
      console.log(obj, prop);
      return obj[prop];
    },
  });
}
```

</Col>

### effect 监听 reactive 数据变化

在不考虑性能的情况对 reactive 及 effect 的最简单的实现，一下代码实现了监听与回掉（最大的问题在性能如给 100 个对象设置 100 个 effect 我们每次执行就需要调用 100\*100 = 10000 遍）

<Col>

```js
let obj = {
  a: 1,
  b: 2,
};
let po = reactive(obj);

// 全局保存所有回掉函数
let callbacks = [];

effect(() => {
  console.log(po);
});

function effect(callback) {
  callbacks.push(callback);
}

function reactive(object) {
  return new Proxy(object, {
    set(obj, prop, val) {
      obj[prop] = val;
      for (let callback of callbacks) {
        callback();
      }
      return obj[prop];
    },
    get(obj, prop) {
      console.log(obj, prop);
      return obj[prop];
    },
  });
}
```

</Col>

### effect 于 reactive 建立连接

建立连接的关键是需要知道 effect 中使用了 reactive 的那些变量，在 effect 中执行 callback 会触发 reactive 中的 get，在 get 中把调用的属性存贮至 useReactivties 中。这样我们就可以知道 effect 中调用了那些数据

<Col>

```js
let obj = {
  a: 1,
  b: 2,
};
let po = reactive(obj);

// 修改为Map来存储响应的数据对象
let callbacks = new Map();

let useReactivties = [];

effect(() => {
  console.log(po.a);
});

function effect(callback) {
  useReactivties = [];
  callback();
  for (let reactivity of useReactivties) {
    // 进行判断避免反复存储
    if (!callbacks.has(reactivity[0])) {
      // 我们需要存放两层 第一层需要存放对象，第二存放属性 所以我们需要set 一个new Map
      callbacks.set(reactivity[0], new Map());
    }
    if (!callbacks.get(reactivity[0]).has(reactivity[1])) {
      callbacks.get(reactivity[0]).set(reactivity[1], []);
    }
    callbacks.get(reactivity[0]).get(reactivity[1]).push(callback);
  }
}

function reactive(object) {
  return new Proxy(object, {
    set(obj, prop, val) {
      obj[prop] = val;

      if (callbacks.get(obj)) {
        if (callbacks.get(obj).get(prop)) {
          for (let callback of callbacks.get(obj).get(prop)) {
            callback();
          }
        }
      }
      return obj[prop];
    },
    get(obj, prop) {
      useReactivties.push([obj, prop]);
      return obj[prop];
    },
  });
}
```

</Col>

</Page>
</pdf-page>
