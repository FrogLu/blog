---
pageClass: custom-page-class
---

# 函数形参的一些注意点

## 参数传递
- 参数传递分为值传递和引用传递，其中值传递分为以变量形参和指针形参，值传递均是通过拷贝实参的方式，来对形参进行初始化，而指针形参之所以能改变函数外变量的值，是因为尽管指针的值是拷贝的，导致和变量形参一样无法修改指针本身的值，但指针可以通过解引用符间接访问指针所指的对象，从而达到修改指针所指对象值的目的。但引用传递并不产生拷贝，因此在大的类类型对象或者容器对象时为了避免拷贝带来的低效，可以采用引用形参避免拷贝，而且对于有的类类型(包括IO类型在内)根本就不支持拷贝操作时，也就只能采用引用形参。
- 对于引用形参需要特别注意的是，如果函数无需改变引用形参的值，最好将其声明为常量引用。常量引用除了能避免对引用对象的修改；由于并不能用常量、字符串字面值等对非常量引用初始化，而可以对常量引用初始化的原因，常量引用还能接受更多的实参类型。
- 因此，相比于C语言中常常使用指针类型的形参访问函数外部的对象，C++更建议使用引用类型的形参替代指针。

## 数组引用
- 对于数组和引用,如下声明是非法的
```
int i = 0, j = 0;
int &arr[] = { i, j };
```
在VS2017 community的默认编译器及默认设置下，会产生`array of reference is not allowed`的报错。在google上搜索该错误后发现，在C++11标准草稿n3092的8.3.2/5中写道
```
There shall be no references to references, no arrays of references,and no pointers to references.
```
原因大概是因为，数组名在绝大多数情况下会被隐式转换成指向数组首个元素的指针，而如果存储引用的数组合法的话，也就意味着存在指向引用的指针，而引用只是对象的别名，并没有大小，这也就导致指针其实并不能指向引用，而是只能指向引用所绑定的对象，另外指向引用的指针也无法像其他类型的指针一样进行指针的算术运算。因此存储引用的数组是非法的。

## Reference
- [FCD(n3092)](http://www.open-std.org/JTC1/SC22/WG21/docs/papers/2010/n3092.pdf)
- [Why are arrays of references illegal?](https://stackoverflow.com/questions/1164266/why-are-arrays-of-references-illegal/33850870)
- [Why it is impossible to create an array of references in c++?](https://stackoverflow.com/questions/5460562/why-it-is-impossible-to-create-an-array-of-references-in-c)
- [Why array of references not allowed in C++](https://www.codeproject.com/Questions/203511/Why-array-of-references-not-allowed-in-C)