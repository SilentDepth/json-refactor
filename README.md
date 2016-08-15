# JSON Refactor

一个可以对JSON数据结构进行重构的工具。或许在你不满接口数据的结构却不能修改接口时用得着？

为简化交流，本文档做如下约定：

- 「JSON对象」指包含JSON数据的语法意义上的对象（`JSON.parse()`返回的那种），本工具不处理字符串格式的JSON；
- 「源对象」指待重构的JSON对象（例如接口传回的数据）；
- 「目标对象」指经本工具重构后输出的JSON对象；
- 「源/目标属性」指源/目标对象的某个K-V对中的`K(ey)`，是一个字符串；
- 「源/目标值」指源/目标对象的某个K-V对中的`V(alue)`，可能是JSON支持的任何数据类型；
- 「处理规则」指本工具将源对象处理为目标对象时依照的规则定义，是一个JavaScript对象；
- 「处理表达式」指处理规则中冒号右侧的表示目标属性/值的字符串；
- 「处理函数」指处理规则中冒号右侧的用来表示对源值的具体处理逻辑的函数（`Function`类型）；

## 功能清单

1. 重命名源属性
2. 转换源值的数据类型为数字（`Number`）或布尔（`Boolean`）（如果转换合法）
3. 对源值进行布尔取反
4. 改变源属性的位置（例如`foo: 1`变成`foo.bar: 1`、`foo: 1`变成`foo: [1]`）
5. 自定义源值处理逻辑（即「处理函数」）
6. 遍历处理数组类型的源值

## 基本用法

为便于表达，示例代码中的JSON对象都以JavaScript对象的形式书写。

### 调用参数

```
[Object] jsonRefactor(<oldJson> [, <target> ], <map>);
```

- `<oldJson>`：源对象，必须参数，本工具不会它做任何修改或引用
- `<target>`：目标对象，可选参数，如果提供则会增量修改其中的属性，否则以一个空对象代替，并成为最终的返回值
- `<map>`：处理规则，必须参数，详见下文

### 改变源属性的名称和位置

``` javascript
// 源对象
var oldJson = {
    'foo': 1,
    'bar': {baz: 2},
    'qux': 3,
    'corge': 4,
    'grault': 5,
    'garply': 6,
    'waldo': [7, 8]
};

// 处理规则
var map = {
    'foo': 'another_foo',
    'bar.baz': 'baz_on_root',
    'qux': 'another_qux.created_quux',
    'corge': 'array_corge[]',
    'grault': 'array_grault[2],
    'garply': 'array_garply[].real_garply',
    'waldo[1]': 'one_of_waldo'
};

var newJson = jsonRefactor(oldJson, map);

// 处理结果
{
    'string_value': 'whatever',
    'number_value': 3.14159,
    'boolean_value': true,
    'bool2': false,
    'sites': [
        {
            'name': 'Apple',
            'url': 'http://www.apple.com/cn/'
        },
        'blank'
    ]
}
```

## 进阶用法

### 自定义函数

如果你希望对原对象的值进行更复杂的处理，可以在处理规则中提供处理函数：

``` javascript
var oldJson = {
    'old_value': 'world'
};
var map = {
    'old_value': function (value) { // <-- 处理函数
        return {
            key: 'new_value',
            value: 'Hello ' + value
        };
    }
};
var newJson = jsonRefactor(oldJson, map);

// 重构结果
{
    'new_value': 'Hello world'
}
```

`jsonRefactor`会将原对象对应属性的值传入该处理函数，并以函数返回值的`key`属性值为对应在新对象中的属性，`value`属性值为存入新对象的值。

### 遍历原值

如果原值是一个数组，你希望对其中每一个元素做相同的重构处理，可以添加遍历标记：

``` javascript
var oldJson = {
    'arr': [
        {'name': 'iPhone', 'stock': 0},
        {'name': 'iPad', 'stock': 7}
    }
};
var map = {
    'arr[]': { // <-- 遍历标记
        key: 'stock_list[]', // <-- 必须有push标记
        map: {
            'name': 'name',
            'stock': '!!available'
        }
    }
};
var newJson = jsonRefactor(oldJson, map);

// 重构结果
{
    'stock_list': [
        {'name': 'iPhone', 'available': false},
        {'name': 'iPad', 'available': true}
    ]
}
```