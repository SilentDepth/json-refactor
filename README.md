# JSON Transpiler

将一个JSON根据需要转译成包含另一套属性的转译工具。也许在你发现接口传回的数据不能完全满足需要但又无法修改接口时用得着？

## 基本用法

``` javascript
// 这是你想要转译的JSON对象
let oldJson = {
    'str': 'whatever',
    'num': '3.14159',
    'bool1': 1,
    'bool2': true
    'arr': ['Apple', 'http://www.apple.com/cn/'],
    'arr_el': 'blank'
};

// 这是转译规则
let map = {
    'str': 'string_value', // 把原对象的'a'属性的值赋给新对象的'string_value'属性，相当于改名
    'num': '+number_value', // 在改名的基础上把值转换成数字类型
    'bool1': '!!boolean_value', // 在改名的基础上把值转换成布尔类型
    'bool2': '!bool2', // 当然你也可以不改名，然后把值转换成布尔类型并取反
    'arr[0]': 'sites[0].name', // 对于原值是数组的可以直接取其中的某个元素...
    'arr[1]': 'sites[0].url' // ...并存入新对象的任意位置，原本不存在的中间属性会被自动创建
    'arr_el': 'sites[]' // 也可以直接把原值push进去
};

// 可以开始转译了
let newJson = jsonTranspiler(oldJson, map);

// 你也可以提供一个已有的对象，转译结果会附加到那个对象上
jsonTranspiler(oldJson, newJson, map);

// 让我们看看转译结果
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

如果你希望对原对象的值进行更复杂的处理，可以在转译规则中提供处理函数：

``` javascript
let oldJson = {
    'old_value': 'world'
};
let map = {
    'old_value': function (value) { // <-- 处理函数
        return {
            key: 'new_value',
            value: 'Hello ' + value
        };
    }
};
let newJson = jsonTranspiler(oldJson, map);

// 转译结果
{
    'new_value': 'Hello world'
}
```

`jsonTranspiler`会将原对象对应属性的值传入该处理函数，并以函数返回值的`key`属性值为对应在新对象中的属性，`value`属性值为存入新对象的值。

### 遍历原值

如果原值是一个数组，你希望对其中每一个元素做相同的转译处理，可以添加遍历标记：

``` javascript
let oldJson = {
    'arr': [
        {'name': 'iPhone', 'stock': 0},
        {'name': 'iPad', 'stock': 7}
    }
};
let map = {
    'arr[]': { // <-- 遍历标记
        key: 'stock_list[]', // <-- 必须有push标记
        map: {
            'name': 'name',
            'stock': '!!available'
        }
    }
};
let newJson = jsonTranspiler(oldJson, map);

// 转译结果
{
    'stock_list': [
        {'name': 'iPhone', 'available': false},
        {'name': 'iPad', 'available': true}
    ]
}
```