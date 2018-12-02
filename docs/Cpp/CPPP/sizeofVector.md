---
pageClass: custom-page-class
---

# sizeof(vector&lt;type&gt;)

## sizeof作用于vector和string对象
- 由于我们知道C++标准仅规定了`sizeof(char)`,`sizeof(char8_t)`,`sizeof(signed char)`和`sizeof(unsigned char)`的返回值为1，但是对于其他情况的返回值依赖于计算机硬件平台，以及编译器的设置。只有对string对象或vector对象执行sizeof运算只返回该类型固定部分的大小，不会计算对象中的元素占用了多少空间。
所谓固定部分，也就是指vector或string对象在创建时，即使为空时也存在的对象。比如创建`vector<int>`对象会产生指针或size_t等用于实现的部分。

## vector&lt;int&gt;
- 在测试`sizeof`对`vector<type>`值的时候发现，`sizeof<bool>`的值大于其他`sizeof<type>`的值。在VS2017 Community中可以看到`vector<int>`是有3个`int*`指针，分别用于指向第零元素，指向尾元素，指向对象最大存储空间的end：
![](https://cdn.nlark.com/yuque/0/2018/jpeg/104558/1542618285742-43704300-c95b-4d5a-b0e3-01956b6e2f85.jpeg)
而`vector<bool>`除了有3个`unsigned int*`指针以外，还有一个`_unsigned_int64`的`_Mysize`变量:
![](https://cdn.nlark.com/yuque/0/2018/jpeg/104558/1542618598652-1fcd630f-4f43-4733-b8e3-d09c1432c95e.jpeg)
- 造成这一结果的原因是，`vector<bool>`在早期就被设计出来了，并不是一个STL容器，而早期的时候为了优化性能，vector对象里的并不是和`bool`对象一样是以byte的形式存储的，而是以bit位的形式存储的，因此使得其`vector<bool>`的元素并不是顺序存储的，也就是说并不能通过尾迭代器和首迭代器的差值来获得`vector<bool>`的元素个数，因此需要有一个专门变量用于统计元素个数。而C++标准并未编译器必须执行这一优化，也就是说是否对`vector<bool>`进行上述优化，取决于编译器。也正因为这一历史遗留原因带来的不可控，并不提倡在C++中使用`vector<bool>`。

## Summary
由于`sizeof`的平台依赖性，对于sizeof的返回值不建议做任何提前假设。

## Reference
- [sizeof](https://zh.cppreference.com/w/cpp/language/sizeof)
- [total memory of a C++ class object](https://stackoverflow.com/questions/32931360/total-memory-of-a-c-class-object/32933422#32933422)
- [cout << sizeof(vector&lt;int&gt;);输出是32，为什么？](https://www.zhihu.com/question/34955591)
- [std:vector](https://zh.cppreference.com/w/cpp/container/vector)
- [std::vector&lt;bool&gt;](https://zh.cppreference.com/w/cpp/container/vector_bool)