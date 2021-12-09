---
sidebar: false
prev: false
next: false
---

<pdf-page>
<Page>

# vue 深入理解 Proxy - 2

</Page>

<Page>
## effect 实现 reactive 深层的监听

使用 reactivties 来储存深层的 reactive 监听对象

<Col>

```js
let obj = {
  a: {
    b: 3,
  },
  b: 2,
};

// 修改为Map来存储响应的数据对象
let callbacks = new Map();
// 把所有的reactive 进行缓存
let reactivties = new Map();

let useReactivties = [];

let po = reactive(obj);

effect(() => {
  console.log(po.a.b);
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
  if (reactivties.has(object)) {
    return reactivties.get(object);
  }
  let proxy = new Proxy(object, {
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
      if (typeof obj[prop] === "object") {
        return reactive(obj[prop]);
      }
      return obj[prop];
    },
  });
  // 把对象及相应的proxy进行缓存
  reactivties.set(object, proxy);
  return proxy;
}
```

</Col>
</Page>
</pdf-page>
