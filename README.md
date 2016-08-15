# JSON Refactor

一个可以对JSON数据结构进行重构的工具。或许在你不满接口数据的结构却不能修改接口时用得着？

你可以在[这里](https://silentdepth.github.io/json-refactor/)体验在线版本。

为简化交流，本文档做如下约定：

- 「JSON对象」指包含JSON数据的语法意义上的对象（`JSON.parse()`返回的那种），本工具不处理字符串格式的JSON；
- 「源对象」指待重构的JSON对象（例如接口传回的数据）；
- 「目标对象」指经本工具重构后输出的JSON对象；
- 「源/目标属性」指源/目标对象的某个K-V对中的`K(ey)`，是一个字符串；
- 「源/目标值」指源/目标对象的某个K-V对中的`V(alue)`，可能是JSON支持的任何数据类型；
- 「处理规则」指本工具将源对象处理为目标对象时依照的规则定义，是一个JavaScript对象；
- 「处理表达式」指处理规则中冒号右侧的表示目标属性/值的字符串；
- 「处理函数」指处理规则中冒号右侧的用来表示对源值的具体处理逻辑的函数（`Function`类型）；

## 用法示例

为便于表达，示例代码中的JSON对象都以JavaScript对象的形式书写。

### 调用参数

```
[Object] jsonRefactor( <oldJson> [, <target> ], <map> );
```

- `<oldJson>`：源对象，必须参数，本工具不会它做任何修改或引用
- `<target>`：目标对象，可选参数，如果提供则会增量修改其中的属性，否则以一个空对象代替，并成为最终的返回值
- `<map>`：处理规则，必须参数，详见下文

### 改变源属性的名称和位置

``` javascript
// 源对象
var oldJson = {
    "foo": 1,
    "bar": {baz: 2},
    "qux": 3,
    "corge": 4,
    "grault": 5,
    "garply": 6,
    "waldo": [7, 8]
};

// 处理规则
var map = {
    'foo': 'another_foo',
    'bar.baz': 'baz_on_root',
    'qux': 'another_qux.created_quux',
    'corge': 'array_corge[]',
    'grault': 'array_grault[2]',
    'garply': 'array_garply[].real_garply',
    'waldo[1]': 'one_of_waldo'
};

var newJson = jsonRefactor(oldJson, map);

// 处理结果
{
    "another_foo": 1,
    "baz_on_root": 2,
    "another_qux": {
        "created_quux": 3
    },
    "array_corge": [4],
    "array_grault": [null, null, 5],
    "array_garply": [
        {"real_garply": 6}
    ],
    "one_of_waldo": 8
}
```

### 转换源值类型

``` javascript
// 源对象
var oldJson = {
    "number_to_boolean": 1,
    "string_to_boolean": "true",
    "reversed_boolean": false,
    "string_to_number": "3.14159"
};

// 处理规则
var map = {
    'number_to_boolean': '!!number_to_boolean',
    'string_to_boolean': '!!string_to_boolean',
    'reversed_boolean': '!reversed_boolean',
    'string_to_number': '+string_to_number'
};

var newJson = jsonRefactor(oldJson, map);

// 处理结果
{
    "number_to_boolean": true,
    "string_to_boolean": true,
    "reversed_boolean": true,
    "string_to_number": 3.14159
}
```

`!!`和`!`都会将源值转换成布尔类型。可以转换为`true`的值有：`true`、`"true"`、`1`、`"1"`、`"yes"`、`"t"`、`"y"`（字符串大小写不敏感），其他值都将被转换成`false`。

`+`转换为数字类型的规则遵循JavaScript定义，转换失败的将输出`null`。

### 自定义处理函数

``` javascript
// 源对象
var oldJson = {
    "foo": "world"
};

// 处理规则
var map = {
    'foo': function (value) {
        return {
            key: 'new_foo',
            value: 'Hello ' + value
        };
    }
};

var newJson = jsonRefactor(oldJson, map);

// 处理结果
{
    "new_foo": "Hello world"
}
```

处理函数会被传入源值作为参数，并应当返回一个对象，其中`key`属性值会被解析为目标属性，`value`属性值会被解析为目标值。

### 遍历数组源值

如果源值是一个数组，你希望对其中每一个元素做相同处理，可以添加遍历标记：

``` javascript
// 源对象
var oldJson = {
    "arr": [
        {"name": "iPhone", "stock": 0},
        {"name": "iPad", "stock": 7}
    ]
};

// 处理规则
var map = {
    'arr[]': {
        key: 'stock_list[]',
        map: {
            'name': 'name',
            'stock': function (value) {
                return {
                    key: 'available',
                    value: value > 0
                };
            }
        }
    }
};

var newJson = jsonRefactor(oldJson, map);

// 处理结果
{
    "stock_list": [
        {"name": "iPhone", "available": false},
        {"name": "iPad", "available": true}
    ]
}
```

源属性后缀的`[]`就是遍历标记。带有遍历标记的源属性应对应一个JavaScript对象，其`key`属性值会被解析为目标属性（上例中目标属性后缀的`[]`表示目标值将push入该属性），`map`属性值会作为遍历过程内部的处理规则，应用到每个元素上。

目前只支持被遍历数组处理为一个新的数组。（如果目标属性不后缀`[]`的话，将会取遍历过程的最后一个元素完成处理过程，此时目标值可能不是数组，这在逻辑上是合法的，当然通常没道理这么做。）

## 配置参数

处理规则中的`__json-refactor__`属性值会被解析为配置参数，其应为一个JavaScript对象。目前仅支持一个参数：

- `setUndefined`：布尔类型，为`true`时结果为`undefined`的源值会在目标属性以`null`存在。默认为`false`，结果为`undefined`的源值会在处理过程中被忽略，目标属性将不存在。