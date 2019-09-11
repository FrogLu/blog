---
pageClass: custom-page-class
---

# 浅谈move semantics及copy elision的一点理解

## 背景

对于返回值为对象(为讨论方便，此处所述对象亦包括通常变量所指的内置类型)的函数：
```
Object foo(){
    Object obj;

    return obj;
}
```
以及诸如：
```
Object obj1;
Object obj2=obj1;   //  assume class Object have defined
                    //  copy constructor and operator=
```
这样的传值(pass-by-value)操作会形成拷贝，从而调用构造函数和析构函数，产生开销，
特别地，当Object类是深度定义的很复杂的类时，这将会是不小的开销，从而影响性能。但在C++11
发布之前，C++标准并没有提供一种很好的解决方案。

因为尽管比如返回值为函数局部对象(或对象)的引用或指针的函数，看似避免了返回值的拷贝，
但这样的行为会给整个程序带来致命隐患，而且这一隐患往往是隐式存在的，难以被察觉和解决的。
因为函数内的局部对象在函数执行结束返回以后会被销毁，那么返回这个局部对象的引用或指针将会
是悬垂的，使用这样的引用或指针访问内存块的行为将会是未定义的。

其他如在stack空间(通过new动态分配内存)或heap空间(静态局部对象)等方式尽管避免了拷贝开销，
但都带来了更大安全隐患。Scott Meyers的《Effective C++ 3th》中的item21对以上行为做了详细的解释。顺便提一下，item4提供了一种单线程环境的解决方案，但在多线程环境下仍存在安全隐患。

## 解决方案

为了解决这一问题，C++11一方面引入了移动语义(move semantics)，另一方面将在C++11之前已经被许多主流编译器所采用的copy elision纳入了标准中。

### move semantics

#### 右值引用
为了支持移动语义，C++11提出了右值引用(rvalue reference)以及移动构造(move constructor)函数和移动赋值运算符的概念。

右值引用用&&来表示，用以表示即将销毁、不再使用的临时对象。而在类定义中的移动构造函数和移动赋值运算符的参数规定为右值引用，简单实现如下：
```
class Object{
    Object(Object&& src){
        // 为方便起见并未考虑自赋值等其他情形
        data = src.data;    // data往往为指向对象的指针，避免拷贝
        src.data = nullptr; // “销毁”源对象(src)
    }
}
```

即可以理解成通过将右值引用来“标记”临时对象，触发移动语义，使得在函数返回值或使用赋值运算符时，调用移动构造函数或移动赋值运算符，而不是调用拷贝构造运算符或拷贝赋值运算符，从而避免由于传值拷贝造成的不必要开销，提高性能。

但在实际编程实践中，往往存在尽管一个对象是一个左值，但我们程序员希望对其像右值一样进行移动操作来避免拷贝操作所带来的开销，但通常我们不能直接将一个右值引用绑定到一个左值上：
```
int &&rr1 = 42;     //  正确： 字面常量是右值
int &&rr2 = rr1;    //  错误： 表达式rr1是左值
```
为解决这一问题，C++11引入了std::move来将左值转换（cast）右值。

#### std::move工作基础

std::move的工作基础是C++对于右值引用的模板实参推断进行了如下规定：

考虑如下模板函数：
```
template <typename T> void func(T&&);
```
通常按照我们不能直接将一个右值引用绑定到一个左值上的原则，假定i是一个int对象，那么显然有：
```
func(42);   //  实参是一个int类型的右值；模板参数T是int
func(i);    //  调用不合法，i是左值
```
但是，C++定义了两条例外规则：

首先，将左值传递给函数的右值引用参数时，编译器推断模板类型参数T为其左值引用类型。对于func(i)，T为int&。

在这种情况下，定义了引用折叠：
- X& &、X&& &和X&& &都折叠成类型X &
- 类型X&& &&折叠成X&&

这也就使得我们可以将任意类型的实参传递给T&&类型的函数参数。

#### std::move

C++标准库中的std::move模板定义如下：
```
template <class _Ty>
typename remove_reference_t<_Ty>&& move(_Ty&& _Arg) noexcept {
    return static_cast<remove_reference_t<_Ty>&&>(_Arg);
}
```
其中std::remove_reference<_Ty>::type 为类型_Ty的非引用类型。

理解std::move最重要的是清楚std::move的作用并不是实现移动操作本身，而是实现一种cast，将左值转换成右值，有点类似于将变量Arg打上一个右值标记，强行触发移动语义，从而使得对象调用移动构造函数或移动赋值运算符，实际的移动操作仍需要在对象所属类的移动构造函数和移动赋值运算符中进行定义，这相当于告诉编译器这个对象作为赋值源对象时是可以丢弃的右值：
```
std::string str("move");
std::string&& rr1 = std::move(str);     //  单纯的绑定引用，未触发移动构造，
                                        //  str内元素未被移动
std::string rr2 = std::move(str);       //  触发移动构造，str内元素被移动
```

#### pefect forwarding
pefect forwarding的译名有完美转发，精确转发等，表示将实参联通类型不变地进行转发的行为。
C++11提供了std::forward用于实现pefect forwarding。

std::forwarding的C++11标准库实现如下：
```
template <class _Ty>
_Ty&& forward( remove_reference_t<_Ty>& _Arg ) noexcept {
    return static_cast<_Ty&&>(_Arg);
}
template <class _Ty>
_Ty&& forward( remove_reference_t<_Ty>&& _Arg ) noexcept {
    return static_cast<_Ty&&>(_Arg);
}
```
可以看出与std::move不同的是，std::forward必须通过显式模板实参来调用，且std::forward\<_Ty>返回类型是_Ty&&。

因为如果_Ty是左值Type&，则根据引用折叠，_Ty&&将折叠成Type&，则forward将返回Type&，
反之如果为右值Type&，_Ty&&将折叠成Type&&，则forward将返回Type&&。

### copy elision
copy elision直译为复制省略。来自于(named) return value optimization (返回值优化，(N)ROV)，是一种编译器用于优化函数返回值，避免拷贝开销的技术。C++98/03标准中并没有要求编译器提供这一技术，但当时主流的编译器如GCC，clang等都提供了这一技术，C++11将这一技术写入了标准，并将其称为copy elision。

#### 细节
C++11 draft N3225在section12.8的第32小点中是这么描述的：
（P.S. C++11标准的正式稿是N3242，但是太贵了。。不过N3225这份草稿基本是与C++11正式稿一致的。）
```
32 When certain criteria are met, an implementation is allowed to omit the copy/move construction of a class
object, even if the copy/move constructor and/or destructor for the object have side effects. In such cases,
the implementation treats the source and target of the omitted copy/move operation as simply two different
ways of referring to the same object, and the destruction of that object occurs at the later of the times
when the two objects would have been destroyed without the optimization.123 This elision of copy/move
operations, called copy elision, is permitted in the following circumstances (which may be combined to
eliminate multiple copies):
— in a return statement in a function with a class return type, when the expression is the name of a
non-volatile automatic object (other than a function or catch-clause parameter) with the same cvunqualified type as the function return type, the copy/move operation can be omitted by constructing
the automatic object directly into the function’s return value
— in a throw-expression, when the operand is the name of a non-volatile automatic object (other than
a function or catch-clause parameter) whose scope does not extend beyond the end of the innermost
enclosing try-block (if there is one), the copy/move operation from the operand to the exception
object (15.1) can be omitted by constructing the automatic object directly into the exception object
— when a temporary class object that has not been bound to a reference (12.2) would be copied/moved
to a class object with the same cv-unqualified type, the copy/move operation can be omitted by
constructing the temporary object directly into the target of the omitted copy/move
— when the exception-declaration of an exception handler (Clause 15) declares an object of the same type
(except for cv-qualification) as the exception object (15.1), the copy/move operation can be omitted
by treating the exception-declaration as an alias for the exception object if the meaning of the program
will be unchanged except for the execution of constructors and destructors for the object declared by
the exception-declaration.
```
并给出了一个例子：
```
class Thing {
public:
  Thing();
  ~Thing();
  Thing(const Thing&);
};
Thing f() {
  Thing t;
  return t;
}

Thing t2 = f();
```
还给出了解释：
```
Here the criteria for elision can be combined to eliminate two calls to the copy constructor of class Thing:
the copying of the local automatic object t into the temporary object for the return value of function f()
and the copying of that temporary object into object t2. Effectively, the construction of the local object
t can be viewed as directly initializing the global object t2, and that object’s destruction will occur at
program exit. Adding a move constructor to Thing has the same effect, but it is the move construction from
the temporary object to t2 that is elided. — end example ]
```

也就是说对于语句`Thing t2 = f();`存在两个可以优化的拷贝操作，首先是`f()`函数调用返回语句时有：

```
Thing temp_t = t;
```

这对应第32小点中的第一种情况return statement，然后是函数体执行结束，得到返回值：

```
Thing t2 = temp_t;
```

这对应于第三种情况没有绑定引用的临时变量。

为了更好的了解这一行为，在类成员函数中加入输出语句：

```
class Thing {
public:
  Thing(){
      std::cout << "constructor." << std::endl;
  }
  ~Thing(){
      std::cout << "destructor." << std::endl;
  }
  Thing(const Thing&){
      std::cout << "copy constructor." << std::endl;
  }
};
```

其输出为（#为注释符，其后为注释而非输出）：
```
constructor.    # t2.constructor
destructor.     # main() ends, t2.destrctor
```

而在`f()`函数中加入if-else分支后：
```
Thing f(int n) {
  Thing t, t1;
  if(n > 10){
      return t;
  }
  else{
      return t1;
  }
}

Thing t2 = f(1);
```

其输出为：
```
constructor.    # t and t1
constructor.    # constructor
copy constructor.   # temp_t = t or t1, ' t2 = temp_t ' is optimized
destructor.     # t and t1
destructor.     # destructor
destructor.     # main() ends, t2.destructor
```

由于加入了if-else分支，并不属于第32小点中所描述的四种情况，因此在函数返回值的赋值过程中并没有执行优化。

#### 与std::move的比较
可以看出，在满足第一种情况下的函数中，`copy elision`能够提供更好的优化能力，出于安全考虑并不能返回Type&&，即函数返回语句不能为`return std::move(obj);`，因为这会带来安全隐患，得不偿失。但std::move可以辅助程序员在编译器无法优化的地方进行优化。

## reference
- [C++11 draft N3242 section 12.8(32)](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2011/n3242.pdf)
- [A Brief Introduction to Rvalue References](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2006/n2027.html#Move_Semantics)
- [What is std::move(), and when should it be used?](https://stackoverflow.com/questions/3413470/what-is-stdmove-and-when-should-it-be-used)
- [Rvalue references and move constructors](https://en.wikipedia.org/wiki/C%2B%2B11#Rvalue_references_and_move_constructors)
- [Copy elision](https://en.wikipedia.org/wiki/Copy_elision)
- [Copy elision](https://en.cppreference.com/w/cpp/language/copy_elision)
- [关于C++右值及std::move()的疑问？](https://www.zhihu.com/question/50652989)
- [RVO V.S. std::move](https://www.ibm.com/developerworks/community/blogs/5894415f-be62-4bc0-81c5-3956e82276f3/entry/RVO_V_S_std_move?lang=en)
- [Trusting the Return Value Optimization](https://stackoverflow.com/questions/2131904/trusting-the-return-value-optimization)
- [Named Return Value Optimization in Visual C++ 2005](https://docs.microsoft.com/en-us/previous-versions/ms364057(v=vs.80)?redirectedfrom=MSDN#nrvo_cpp05_topic3)
- [What does “cv-unqualified” mean in C++?](https://stackoverflow.com/questions/15413037/what-does-cv-unqualified-mean-in-c)
- C++ primer 5th
- Effective C++ 3th