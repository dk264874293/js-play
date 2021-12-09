---
sidebar: false
prev: false
next: false
---

<pdf-page>
<Page>

# vue 响应机制

</Page>

<Page>

## 什么是响应式


响应式一直都是 vue 的特色之一,在 js 中是没有响应式的概念的。
如一下代码:

<Col>

    ```js
        let count = 1
        let double = count * 2
        console.log(double)
        count = 2
        console.log(double)
    ```

</Col>
以上两次log都打印为2，即使我们修改了count的数值double也不会响应改变。

double 是根据 count\*2 来计算的，如果我们希望 double 随着 count 的值改变而改变，我们就需要每次修改 count 后重新计算 double。

<Col>

```js
let count = 1;
 // 计算过程封装成函数
 let getDouble = n=>n*2
 //箭头函数let
 double = getDouble(count)
 console.log(double)count = 2
 // 重新计算double，这里我们不能自动执行对double的计算
 double = getDouble(count)
 console.log(double)
```

</Col>

实际开发中计算逻辑会比doube复杂的多，可以封装成一个函数去执行，但是这样每次修改都要手动触发的行为大大增加的复杂度。
我们要考虑的是如何让doube的值可以自动计算。


如果我们想让getDouble函数自动执行，我们需要使用javascript的某中机制，把count包裹一层，每当对count锦绣修改就去同步更新double的值，这就是响应式的雏形

### 响应式原理

响应式的原理是什么？Vue中用过伞中响应式的解决方案分别是 defineProperty、Proxy和value setter。
首先我们来看Vue2的 defineProperty API 这个函数详细API [https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 。


我们定义一个对象obj，使用 defineProperty 代理了count属性。我们对obj对象的value属性实现了拦截，读取count属性的时候执行get函数，修改count属性时之行set函数，并在set函数内部重新计算了double
<Col>

```js
   let getDouble = n => n*2
    let obj = {}
    let count = 1
    let double = getDouble(count)

    Object.defineProperty(obj,'count',{
        get(){
            return count
        },
        set(val){
            count = val
            double = getDouble(val)
        }
    })

    console.log(double); // 2
    obj.count = 2
    console.log(double); // 4

```
</Col>

这样我们就实现了简易的响应式功能。


但 defineProperty API 作为Vue2实现响应式的原理，他的语法中又一些缺陷，比如以下代码中，我们删除`obj.count`属性，set函数就不会执行，double还是之前的数值，这也是vue2中我们需要 $delete 一个专门的函数去删除数据。

<Col>

```js
   delete obj.count
   console.log(double) // double 还是4

```
</Col>


Vue3 的响应式机制是基于Proxy实现的，Proxy就是代理他的中药意义在于解决了Vue2的响应式缺陷。在下面的代码中通过new Proxy代理了obj对象，然后通过get、set和deleteProperty函数代理了对象的读书、修改和删除操作，从而实现了响应式的功能。


<Col>

```js
   let proxy = new Proxy(obj,{
        get(target,prop){
            return target[prop]
        },
        set(target,prop,value){
            target[prop] = value
            if(prop === 'count'){
                double = getDouble(value);
            }
        },
        deleteProperty(target,prop){
            delete target[prop]
            if(prop === 'count'){
                double = NaN
            }
        }
    })

    console.log(obj.count,double)
    proxy.count = 2
    console.log(obj.count, double);
    delete proxy.count
    console.log(obj.count, double);
    // 删除属性后，打印时输出的结果就回事 undefined NaN

```
</Col>

从这里可以看出proxy实现的功能与vue2的 defineProperty类似，他们都可以在修改数据时触发set函数来更新double的功能。并且proxy还完善了几个defineProperty的缺陷，比如可以监听属性的删除。

Proxy是针对对象监听，而不是针对某个属性，所以不仅可以代理那些定义是不存在的属性，还可以代理更丰富的数据结构，比如Map、Set等，并且我们也能通过deleteProperty实现的数据删除的监听。

<Col>

```js
  import { reactive,computed,watchEffect } from 'vue'
  let obj = reactive({
      count:1
  })

  let double = computed(() => obj.count * 2)

  obj.count = 2

  watchEffect(() => {
      console.log('数据被修改了',obj.count,double.value)
  })

```
</Col>

以上代码中，vue3的reactive函数可以把一个对象编程响应式数据，而reactive就是基于Proxy实现的，我们还可以通过watchEffect，在obj.count修改后执行数据打印

在vue3中还有另一种响应式逻辑，利用对象的get合set函数进行监听，这种响应式的实现方式，只拦截了某一个属性的修改，这也是vue3中ref这个api的实现。在下面的代码中我们拦截了count的value属性并且拦截set操作，也能实现了类似的功能。

<Col>

```js
  let getDouble = n => n*2
  let _value = 1

  let double = getDouble(_value)

  let count = {
      get value(){
          return _value
      },
      set value(val){
          _value = val
          double = getDouble(val)
      }
  }

  console.log(count.value,double)
  count.value = 2
  console.log(count.value,double)

```
</Col>

### 总结

|  实现原理   | defineProperty  | Proxy  |  value setter  |
|  :----:  | :----:  | :----:  |  :----:  |
| 实际场景  | vue2响应式 | Vue3 reactive | vue3 ref |
| 优势  | 兼容性 | 基于Proxy实现真正的拦截 | 实现简单 |
| 实际场景  | 数据和属性删除等拦截不了 | 兼容不了IE11 | 只拦截了value属性 |
| 优势  | vue2 | vue3 复杂数据结构 | vue3简单数据结构 |


</Page>
</pdf-page>