import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { LearningPath } from '../src/models/LearningPath.js';
import { Module } from '../src/models/Module.js';
import { Section } from '../src/models/Section.js';
import { Topic } from '../src/models/Topic.js';
import { Note } from '../src/models/Note.js';
import { Playground } from '../src/models/Playground.js';
import { Quiz } from '../src/models/Quiz.js';
import { Resource } from '../src/models/Resource.js';
import { InterviewQuestion } from '../src/models/InterviewQuestion.js';

/* ==========================================================================
   C++ SEED DATA DEFINITION
   ========================================================================== */

export const cppLearningPath = {
  title: 'Modern C++ Programming',
  slug: 'cpp',
  description:
    'Master modern C++ from core syntax, memory layout, pointers, and references to object-oriented design, RAII, move semantics, smart pointers, and the Standard Template Library (STL).',
  category: 'Systems Programming',
  level: 'Intermediate',
  estimatedHours: 35,
  icon: 'Cpu',
  color: 'blue',
  published: true,
  modules: [
    {
      title: 'C++ Fundamentals & Memory Management',
      description: 'Core syntax, primitive types, memory layout, stack vs heap, pointers, and references.',
      duration: '8 hours',
      topics: ['Variables & Primitive Types', 'Control Flow & Functions', 'Pointers & Addresses', 'References & Const'],
      order: 1,
    },
    {
      title: 'Object-Oriented C++ & RAII',
      description: 'Classes, constructors/destructors, RAII idiom, runtime polymorphism, and virtual dispatch.',
      duration: '9 hours',
      topics: ['Classes & Constructors', 'The RAII Idiom', 'Virtual Functions & Polymorphism', 'The Rule of 3, 5, and 0'],
      order: 2,
    },
    {
      title: 'Standard Template Library (STL)',
      description: 'Iterators, sequential containers, associative maps, and standard algorithms with lambdas.',
      duration: '9 hours',
      topics: ['std::vector & Sequence Containers', 'std::map & Hash Tables', 'STL Algorithms & Modern Lambdas'],
      order: 3,
    },
    {
      title: 'Modern C++ & Smart Pointers',
      description: 'Smart pointers, ownership semantics, move semantics, rvalue references, and templates.',
      duration: '9 hours',
      topics: ['std::unique_ptr & std::shared_ptr', 'Move Semantics & Rvalues', 'Templates & Generic Programming'],
      order: 4,
    },
  ],
};

export const cppModules = [
  {
    pathSlug: 'cpp',
    title: 'C++ Fundamentals & Memory Management',
    slug: 'cpp-fundamentals',
    description:
      'Gain a solid grounding in C++ execution mechanics, strong static typing, stack vs heap allocations, raw pointers, and references.',
    duration: '8 hours',
    order: 1,
    topics: [
      'Variables & Primitive Types',
      'Control Flow & Functions',
      'Pointers & Addresses',
      'References & Const Correctness',
    ],
    learningObjectives: [
      'Understand C++ strong static typing and compilation pipeline',
      'Differentiate between stack memory and dynamic heap allocation',
      'Manipulate raw pointers and inspect memory addresses with the address-of and dereference operators',
      'Enforce immutability and optimize parameter passing using const references',
    ],
  },
  {
    pathSlug: 'cpp',
    title: 'Object-Oriented C++ & RAII',
    slug: 'cpp-oop-raii',
    description:
      'Learn idiomatic C++ object design: encapsulation, class lifecycles, RAII (Resource Acquisition Is Initialization), inheritance, and virtual functions.',
    duration: '9 hours',
    order: 2,
    topics: [
      'Classes & Constructors',
      'The RAII Idiom',
      'Virtual Functions & Polymorphism',
      'The Rule of 3, 5, and 0',
    ],
    learningObjectives: [
      'Design clean classes utilizing member initializer lists and custom destructors',
      'Apply the RAII paradigm for leak-free, deterministic resource management',
      'Implement dynamic polymorphism using abstract base classes and virtual member functions',
      'Adhere to the Rule of 0, 3, and 5 for safe copying and moving',
    ],
  },
  {
    pathSlug: 'cpp',
    title: 'Standard Template Library (STL)',
    slug: 'cpp-stl',
    description:
      'Leverage the industrial-strength Standard Template Library: contiguous vectors, node-based maps, hash tables, iterators, and high-performance algorithms.',
    duration: '9 hours',
    order: 3,
    topics: [
      'std::vector & Sequence Containers',
      'std::map & Hash Tables',
      'STL Algorithms & Modern Lambdas',
    ],
    learningObjectives: [
      'Utilize std::vector with knowledge of capacity, size, and amortized constant-time reallocation',
      'Evaluate trade-offs between std::map (ordered Red-Black tree) and std::unordered_map (O(1) hash table)',
      'Compose powerful data transformation pipelines with std::sort, std::find_if, and C++ lambdas',
    ],
  },
  {
    pathSlug: 'cpp',
    title: 'Modern C++ & Smart Pointers',
    slug: 'cpp-modern-smart-pointers',
    description:
      'Adopt modern C++11 through C++20 features: unique_ptr, shared_ptr, weak_ptr, rvalue references, move semantics, and template metaprogramming.',
    duration: '9 hours',
    order: 4,
    topics: [
      'std::unique_ptr & std::shared_ptr',
      'Move Semantics & Rvalues',
      'Templates & Generic Programming',
    ],
    learningObjectives: [
      'Eliminate memory leaks by replacing raw owning pointers with std::unique_ptr and std::make_unique',
      'Manage shared ownership safely and resolve cyclic reference leaks with std::weak_ptr',
      'Optimize performance with move constructors and rvalue references (&&)',
      'Write type-safe generic code using C++ function and class templates',
    ],
  },
];

export const cppSections = [
  // Module 1 Sections
  {
    moduleSlug: 'cpp-fundamentals',
    title: 'Syntax, Types & Control Flow',
    slug: 'cpp-syntax-types',
    description: 'Foundational C++ syntax, primitive types, fixed-width types, and structured control flow.',
    duration: '4 hours',
    order: 1,
    items: ['Variables & Primitive Types', 'Control Flow & Functions'],
    content: `# C++ Syntax, Types & Compilation

C++ is a compiled, statically typed, multi-paradigm systems language designed for maximum execution performance and hardware control.

## Compilation Model
1. **Preprocessor**: Expands macros and \`#include\` directives.
2. **Compiler**: Translates C++ code into machine assembly.
3. **Assembler**: Converts assembly to object files (\`.o\` / \`.obj\`).
4. **Linker**: Combines object files and standard libraries into a binary executable.
`,
  },
  {
    moduleSlug: 'cpp-fundamentals',
    title: 'Pointers, References & The Memory Model',
    slug: 'cpp-pointers-memory',
    description: 'Explore pointers, memory addresses, pointer arithmetic, references, and const correctness.',
    duration: '4 hours',
    order: 2,
    items: ['Pointers & Addresses', 'References & Const Correctness'],
    content: `# The C++ Memory Model

Understanding how C++ manages memory is essential for writing fast, crash-free applications.

- **Stack**: Fast, automatic allocation managed by the CPU for local variables.
- **Heap (Free Store)**: Dynamically allocated memory using \`new\` and \`delete\`.
- **Pointers**: Variables holding the numeric address of another memory location.
- **References**: Non-null aliases for existing variables.
`,
  },

  // Module 2 Sections
  {
    moduleSlug: 'cpp-oop-raii',
    title: 'Classes, Lifecycles & RAII',
    slug: 'cpp-classes-raii-section',
    description: 'Deep dive into encapsulation, constructors, destructors, and the core RAII idiom.',
    duration: '4.5 hours',
    order: 1,
    items: ['Classes & Constructors', 'The RAII Idiom'],
    content: `# Classes and RAII in C++

C++ classes allow developers to bundle data and functionality together while strictly controlling access via \`public\`, \`private\`, and \`protected\` specifiers.

## Resource Acquisition Is Initialization (RAII)
RAII ties the lifecycle of a resource (heap memory, file handles, mutex locks) to the lifetime of an automatic (stack) object.
`,
  },
  {
    moduleSlug: 'cpp-oop-raii',
    title: 'Inheritance, Polymorphism & Object Lifecycles',
    slug: 'cpp-polymorphism-section',
    description: 'Runtime polymorphism via virtual functions, abstract classes, and the Rule of 0/3/5.',
    duration: '4.5 hours',
    order: 2,
    items: ['Virtual Functions & Polymorphism', 'The Rule of 3, 5, and 0'],
    content: `# Dynamic Polymorphism in C++

Polymorphism allows derived classes to be manipulated through pointers or references to base classes.

- **virtual**: Enables dynamic dispatch via a Virtual Method Table (vtable).
- **= 0**: Declares a pure virtual function, making the class abstract.
- **override**: Informs the compiler to ensure a base method is actually being overridden.
`,
  },

  // Module 3 Sections
  {
    moduleSlug: 'cpp-stl',
    title: 'STL Containers & Iterators',
    slug: 'cpp-containers-section',
    description: 'Explore std::vector, std::array, std::map, and std::unordered_map.',
    duration: '4.5 hours',
    order: 1,
    items: ['std::vector & Sequence Containers', 'std::map & Hash Tables'],
    content: `# The Standard Template Library (STL)

The C++ STL provides production-ready, standardized containers, iterators, and algorithms.

## Key Containers
- **std::vector**: Contiguous dynamically-sized array.
- **std::array**: Fixed-size contiguous array with zero runtime overhead.
- **std::map**: Sorted associative container implemented via self-balancing Red-Black trees.
- **std::unordered_map**: Hash table providing O(1) average lookup time.
`,
  },
  {
    moduleSlug: 'cpp-stl',
    title: 'STL Algorithms & Modern Lambdas',
    slug: 'cpp-algorithms-section',
    description: 'Transform, filter, sort, and query collections using <algorithm> and lambda closures.',
    duration: '4.5 hours',
    order: 2,
    items: ['STL Algorithms & Modern Lambdas'],
    content: `# STL Algorithms & Lambda Expressions

Separating data structures from algorithms is the defining architectural achievement of the C++ STL.

Using \`std::sort\`, \`std::find_if\`, \`std::transform\`, and modern lambda expressions (\`[capture](params){ body }\`) enables expressive, highly optimized functional pipelines.
`,
  },

  // Module 4 Sections
  {
    moduleSlug: 'cpp-modern-smart-pointers',
    title: 'Smart Pointers & Ownership Semantics',
    slug: 'cpp-smart-pointers-section',
    description: 'Modern memory management with std::unique_ptr, std::shared_ptr, and std::weak_ptr.',
    duration: '4.5 hours',
    order: 1,
    items: ['std::unique_ptr & std::shared_ptr'],
    content: `# Smart Pointers in Modern C++

Since C++11, explicit \`delete\` calls are considered an anti-pattern. Smart pointers manage memory automatically using RAII semantics.

- **std::unique_ptr**: Exclusive ownership with zero runtime overhead.
- **std::shared_ptr**: Shared ownership with thread-safe reference counting.
- **std::weak_ptr**: Non-owning observer preventing cyclic memory retention.
`,
  },
  {
    moduleSlug: 'cpp-modern-smart-pointers',
    title: 'Move Semantics & Generic Templates',
    slug: 'cpp-move-templates-section',
    description: 'Eliminate deep copies with std::move and build generic components with templates.',
    duration: '4.5 hours',
    order: 2,
    items: ['Move Semantics & Rvalues', 'Templates & Generic Programming'],
    content: `# Move Semantics and C++ Templates

## Move Semantics
Move semantics allow the compiler to "steal" resources from temporary objects (rvalues) instead of performing expensive deep memory allocations.

## Templates
Templates enable writing type-independent algorithms and containers that are instantiated with zero runtime performance cost.
`,
  },
];

export const cppTopics = [
  // Topics for 'cpp-syntax-types'
  {
    sectionSlug: 'cpp-syntax-types',
    title: 'Variables & Primitive Types',
    slug: 'cpp-variables-types',
    summary: 'Strong static typing, integer widths, floating points, and boolean semantics in C++.',
    description:
      'Learn how C++ represents numbers, characters, and booleans in hardware memory, including explicit size guarantees with <cstdint>.',
    duration: '25 mins',
    order: 1,
    keyPoints: [
      'Statically typed: variable types are fixed at compile-time',
      'Fundamental types: bool, char, int, float, double',
      'Fixed-width integers from <cstdint>: int8_t, int32_t, int64_t, uint32_t',
      'Type casting: prefer static_cast<Target>(val) over C-style casts',
    ],
    codeExamples: [
      {
        title: 'Fundamental Types & Fixed Width',
        language: 'cpp',
        code: `#include <iostream>\n#include <cstdint>\n\nint main() {\n    int age = 28;\n    double salary = 95400.50;\n    bool isRemote = true;\n    int64_t largeCounter = 10000000000LL;\n\n    std::cout << "Age: " << age << ", Remote: " << std::boolalpha << isRemote << "\\n";\n    std::cout << "Large counter: " << largeCounter << "\\n";\n    return 0;\n}`,
        explanation: 'Shows standard variable declaration and modern fixed-width integer types guaranteed to have exact bit sizes.',
      },
    ],
    content: `# Variables & Primitive Types in C++

In C++, every variable has an explicit type that determines how much memory is allocated and how the bits are interpreted.

## Fixed-Width Integer Types
Because \`int\` and \`long\` sizes vary across operating systems, modern C++ code uses \`<cstdint>\`:
- \`int32_t\`: Exactly 32-bit signed integer
- \`uint64_t\`: Exactly 64-bit unsigned integer
`,
  },
  {
    sectionSlug: 'cpp-syntax-types',
    title: 'Control Flow & Functions',
    slug: 'cpp-control-flow',
    summary: 'Branching, iterative loops, function signatures, and pass-by-value fundamentals.',
    description:
      'Master conditionals, switch statements, range-based for loops, and function definitions in C++.',
    duration: '25 mins',
    order: 2,
    keyPoints: [
      'Conditionals: if, else if, else, and init-statement if (if (auto val = func(); val > 0))',
      'Loops: while, do-while, and modern range-based for (const auto& item : list)',
      'Functions require explicit return types and parameter types',
      'Default arguments can be specified in the function declaration',
    ],
    codeExamples: [
      {
        title: 'Range-Based For Loop & Init-If',
        language: 'cpp',
        code: `#include <iostream>\n#include <vector>\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    if (int sum = add(15, 25); sum > 30) {\n        std::cout << "Sum exceeds 30: " << sum << "\\n";\n    }\n    return 0;\n}`,
        explanation: 'Demonstrates C++17 init-statement if and modular function declaration.',
      },
    ],
    content: `# Control Flow & Functions in C++

C++ provides standard structured programming constructs along with modern ergonomic enhancements like range-based for loops and init-statement conditionals.
`,
  },

  // Topics for 'cpp-pointers-memory'
  {
    sectionSlug: 'cpp-pointers-memory',
    title: 'Pointers & Addresses',
    slug: 'cpp-pointers',
    summary: 'Direct memory addresses, the address-of operator (&), and dereferencing (*).',
    description:
      'Understand raw pointer mechanics: storing memory addresses, dereferencing values, nullptr safety, and pointer arithmetic.',
    duration: '35 mins',
    order: 1,
    keyPoints: [
      'A pointer holds the memory address of another variable',
      'Use & (address-of) to get an address; use * (dereference) to access or mutate the pointed-to value',
      'Always initialize unassigned pointers with nullptr (never NULL or 0)',
      'Dereferencing a wild or dangling pointer causes Undefined Behavior (UB)',
    ],
    codeExamples: [
      {
        title: 'Pointer Address & Dereference',
        language: 'cpp',
        code: `#include <iostream>\n\nint main() {\n    int value = 42;\n    int* ptr = &value; // ptr stores address of value\n\n    std::cout << "Direct value: " << value << "\\n";\n    std::cout << "Pointer address: " << ptr << "\\n";\n    std::cout << "Dereferenced value: " << *ptr << "\\n";\n\n    *ptr = 99; // Mutates original value\n    std::cout << "Updated value: " << value << "\\n";\n    return 0;\n}`,
        explanation: 'Demonstrates assigning a memory address to a pointer and mutating the original variable through the dereference operator.',
      },
    ],
    content: `# Pointers in C++

Pointers give C++ programmers direct, unmediated control over system memory.

## Pointer Syntax
\`\`\`cpp
int x = 100;
int* p = &x;  // p holds memory address of x
*p = 200;     // changes x to 200
\`\`\`

## Safety with \`nullptr\`
In modern C++, never use \`0\` or \`NULL\` for null pointer literals. Use \`nullptr\`, which has its own type \`std::nullptr_t\` and prevents accidental integer overloads.
`,
  },
  {
    sectionSlug: 'cpp-pointers-memory',
    title: 'References & Const Correctness',
    slug: 'cpp-references',
    summary: 'Aliases, pass-by-reference, and enforcing compiler-checked immutability with const.',
    description:
      'Learn why references are safer aliases than pointers, how to pass large objects efficiently without copying, and how const guarantees immutability.',
    duration: '30 mins',
    order: 2,
    keyPoints: [
      'A reference (Type&) is an immutable alias to an existing object; it cannot be null or rebound',
      'Pass-by-const-reference (const Type&) avoids copying overhead while preventing mutations',
      'const correctness: mark functions and variables const whenever mutation is not intended',
      'const int* p is a pointer to constant data; int* const p is a constant pointer',
    ],
    codeExamples: [
      {
        title: 'Pass-by-Const-Reference',
        language: 'cpp',
        code: `#include <iostream>\n#include <string>\n\n// No copy is made; read-only access is guaranteed\nvoid printMessage(const std::string& msg) {\n    std::cout << "Message: " << msg << "\\n";\n}\n\nint main() {\n    std::string text = "Hello Modern C++";\n    printMessage(text);\n    return 0;\n}`,
        explanation: 'Using const std::string& passes the 32-byte string object by memory address without invoking the copy constructor.',
      },
    ],
    content: `# References & Const Correctness in C++

Unlike pointers, references cannot be reassigned to point to another object and cannot be null.

\`\`\`cpp
int original = 10;
int& ref = original; // ref is an alias for original
ref = 50;            // original is now 50
\`\`\`

## Best Practice: Passing Parameters
1. **Pass by value**: Small primitive types (\`int\`, \`double\`, \`char\`).
2. **Pass by const reference**: Large objects (\`std::string\`, \`std::vector\`, custom classes).
3. **Pass by non-const reference**: When the function explicitly needs to modify the caller's argument.
`,
  },

  // Topics for 'cpp-classes-raii-section'
  {
    sectionSlug: 'cpp-classes-raii-section',
    title: 'Classes, Constructors & Destructors',
    slug: 'cpp-classes',
    summary: 'Encapsulation, member initializer lists, and deterministic object lifecycles.',
    description:
      'Build robust classes in C++ with private member variables, public member functions, constructors, and destructors.',
    duration: '35 mins',
    order: 1,
    keyPoints: [
      'Classes default to private access; structs default to public access',
      'Member initializer lists (: member(val)) avoid default construction followed by assignment',
      'Destructors (~ClassName) are called automatically when stack objects leave scope',
      'const member functions guarantee they will not modify class member variables',
    ],
    codeExamples: [
      {
        title: 'Class with Member Initializer List & Destructor',
        language: 'cpp',
        code: `#include <iostream>\n#include <string>\n\nclass Student {\nprivate:\n    std::string name;\n    int id;\n\npublic:\n    Student(std::string n, int i) : name(n), id(i) {\n        std::cout << "Constructed: " << name << "\\n";\n    }\n\n    ~Student() {\n        std::cout << "Destructed: " << name << "\\n";\n    }\n\n    void display() const {\n        std::cout << "Student: " << name << " [ID: " << id << "]\\n";\n    }\n};\n\nint main() {\n    {\n        Student s1("Alice", 101);\n        s1.display();\n    } // s1 leaves scope here -> destructor runs immediately!\n    return 0;\n}`,
        explanation: 'Illustrates member initializer syntax, const member inspection, and deterministic destructor execution at block boundary.',
      },
    ],
    content: `# Classes, Constructors & Destructors

C++ object lifecycles are strictly deterministic. Unlike garbage-collected languages where cleanup happens unpredictably in the background, C++ destructors run the exact microsecond an object leaves scope.
`,
  },
  {
    sectionSlug: 'cpp-classes-raii-section',
    title: 'The RAII Idiom',
    slug: 'cpp-raii',
    summary: 'Resource Acquisition Is Initialization: automatic, exception-safe resource management.',
    description:
      'Master the most important idiom in C++: binding resources to stack object lifecycles to eliminate memory leaks and dangling resources.',
    duration: '35 mins',
    order: 2,
    keyPoints: [
      'RAII: Resource Acquisition Is Initialization',
      'Resources (heap memory, sockets, files, locks) are acquired in the constructor',
      'Resources are guaranteed to be released in the destructor upon scope exit',
      'Exception safe: destructors are guaranteed to run during stack unwinding',
    ],
    codeExamples: [
      {
        title: 'RAII File Wrapper',
        language: 'cpp',
        code: `#include <iostream>\n#include <fstream>\n#include <string>\n\nclass FileHandler {\nprivate:\n    std::ofstream file;\n\npublic:\n    explicit FileHandler(const std::string& filename) {\n        file.open(filename);\n        std::cout << "File opened: " << filename << "\\n";\n    }\n\n    ~FileHandler() {\n        if (file.is_open()) {\n            file.close();\n            std::cout << "File automatically closed by RAII destructor\\n";\n        }\n    }\n\n    void writeLine(const std::string& line) {\n        file << line << "\\n";\n    }\n};\n\nint main() {\n    {\n        FileHandler handler("output.log");\n        handler.writeLine("First log entry.");\n    } // Closes file cleanly here, even if an exception was thrown!\n    return 0;\n}`,
        explanation: 'Shows how an RAII wrapper guarantees closing the file descriptor upon leaving scope without manual close() calls.',
      },
    ],
    content: `# Resource Acquisition Is Initialization (RAII)

RAII is the core foundation of C++ stability and safety.

By binding system resources to stack objects, C++ guarantees deterministic destruction:
1. When entering a scope, constructor allocates the resource.
2. When exiting the scope (via normal return, break, or exception throw), destructor cleans up the resource.
`,
  },

  // Topics for 'cpp-polymorphism-section'
  {
    sectionSlug: 'cpp-polymorphism-section',
    title: 'Virtual Functions & Polymorphism',
    slug: 'cpp-virtual-functions',
    summary: 'Virtual member functions, abstract interfaces, and vtable runtime dispatch.',
    description:
      'Implement dynamic runtime polymorphism with virtual functions, override specifiers, and pure virtual methods.',
    duration: '35 mins',
    order: 1,
    keyPoints: [
      'The virtual keyword enables dynamic method dispatch through the vtable (virtual method table)',
      'Always declare base class destructors virtual to prevent partial destruction leaks',
      'A pure virtual function (= 0) makes a class abstract and non-instantiable',
      'Always mark derived overrides with the override specifier to catch signature mismatches',
    ],
    codeExamples: [
      {
        title: 'Abstract Interface & Virtual Dispatch',
        language: 'cpp',
        code: `#include <iostream>\n#include <memory>\n#include <vector>\n\nclass Shape {\npublic:\n    virtual ~Shape() = default; // Essential virtual destructor\n    virtual double area() const = 0; // Pure virtual function\n};\n\nclass Circle : public Shape {\nprivate:\n    double radius;\npublic:\n    explicit Circle(double r) : radius(r) {}\n    double area() const override {\n        return 3.14159 * radius * radius;\n    }\n};\n\nint main() {\n    Circle circle(5.0);\n    const Shape& shapeRef = circle;\n    std::cout << "Shape area: " << shapeRef.area() << "\\n";\n    return 0;\n}`,
        explanation: 'Demonstrates an abstract Shape base class with pure virtual area() and polymorphic invocation via a base reference.',
      },
    ],
    content: `# Virtual Functions & Polymorphism in C++

When you invoke a member function through a pointer or reference to a base class, C++ uses dynamic dispatch to call the derived implementation if the function is marked \`virtual\`.

## Why Virtual Destructors are Mandatory
If you delete a derived object through a base pointer without a virtual destructor:
\`\`\`cpp
Base* b = new Derived();
delete b; // UB! Only ~Base() runs; ~Derived() is skipped!
\`\`\`
Marking \`virtual ~Base() = default;\` solves this.
`,
  },
  {
    sectionSlug: 'cpp-polymorphism-section',
    title: 'The Rule of 3, 5, and 0',
    slug: 'cpp-rule-of-five',
    summary: 'Managing copy constructors, copy assignment, move constructors, and destructors.',
    description:
      'Learn how to write safe resource-owning classes with the Rule of Three (C++98) and the Rule of Five (Modern C++).',
    duration: '30 mins',
    order: 2,
    keyPoints: [
      'Rule of 0: Prefer classes that do not manually manage raw resources (use standard containers and smart pointers)',
      'Rule of 3: If you define a destructor, copy constructor, or copy assignment, you likely need all 3',
      'Rule of 5: In modern C++, also define move constructor and move assignment operator for efficiency',
      'Defaulting and deleting: use = default and = delete to control special member generation',
    ],
    codeExamples: [
      {
        title: 'Explicitly Deleting Copying to Enforce Unique Ownership',
        language: 'cpp',
        code: `#include <iostream>\n\nclass NonCopyableResource {\npublic:\n    NonCopyableResource() = default;\n\n    // Prevent copying\n    NonCopyableResource(const NonCopyableResource&) = delete;\n    NonCopyableResource& operator=(const NonCopyableResource&) = delete;\n\n    // Allow moving\n    NonCopyableResource(NonCopyableResource&&) noexcept = default;\n    NonCopyableResource& operator=(NonCopyableResource&&) noexcept = default;\n};\n\nint main() {\n    NonCopyableResource res1;\n    // NonCopyableResource res2 = res1; // Compile error! Copying deleted.\n    NonCopyableResource res3 = std::move(res1); // OK! Moving allowed.\n    return 0;\n}`,
        explanation: 'Shows modern C++ practice using = delete to prevent accidental deep copying of non-copyable system handles.',
      },
    ],
    content: `# The Rule of 3, 5, and 0

## The Rule of 0
The modern C++ best practice: your classes should rarely need custom destructors or copy constructors. If you compose classes using \`std::string\`, \`std::vector\`, and smart pointers, the compiler-generated operations are automatically 100% correct.
`,
  },

  // Topics for 'cpp-containers-section'
  {
    sectionSlug: 'cpp-containers-section',
    title: 'std::vector & Sequence Containers',
    slug: 'cpp-vector',
    summary: 'Contiguous memory, capacity vs size, iteration, and amortized push_back().',
    description:
      'Deep dive into std::vector: how it manages dynamic contiguous memory, pointer stability, and optimal capacity reservation.',
    duration: '35 mins',
    order: 1,
    keyPoints: [
      'std::vector is the default container in C++: elements are stored contiguously in heap memory',
      'size() is the number of active elements; capacity() is the total memory allocated before reallocation',
      'reserve() pre-allocates buffer space, avoiding costly reallocations and iterator invalidation',
      'emplace_back() constructs elements in-place inside the buffer, avoiding temporary copies',
    ],
    codeExamples: [
      {
        title: 'Vector Operations & Pre-allocation',
        language: 'cpp',
        code: `#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> numbers;\n    numbers.reserve(5); // Pre-allocate memory for 5 elements\n\n    numbers.push_back(10);\n    numbers.push_back(20);\n    numbers.push_back(30);\n\n    std::cout << "Size: " << numbers.size() << ", Capacity: " << numbers.capacity() << "\\n";\n\n    for (int n : numbers) {\n        std::cout << n << " ";\n    }\n    std::cout << "\\n";\n    return 0;\n}`,
        explanation: 'Demonstrates pre-allocating capacity with reserve() and iterating using modern range-for.',
      },
    ],
    content: `# std::vector: The Workhorse of C++

In 95% of performance-critical code, \`std::vector\` beats linked lists because CPU caches love contiguous memory.

## Reallocation Mechanics
When \`push_back()\` exceeds \`capacity()\`, the vector:
1. Allocates a new heap buffer (typically 1.5x or 2x larger).
2. Moves all existing elements to the new buffer.
3. Deallocates the old buffer.
4. **All existing pointers and iterators to the old vector elements are invalidated!**
`,
  },
  {
    sectionSlug: 'cpp-containers-section',
    title: 'std::map & Hash Tables',
    slug: 'cpp-maps',
    summary: 'Ordered tree-based lookup (std::map) vs average O(1) hash tables (std::unordered_map).',
    description:
      'Compare std::map and std::unordered_map: key sorting, hash functions, time complexity, and memory overhead.',
    duration: '30 mins',
    order: 2,
    keyPoints: [
      'std::map is an ordered Red-Black tree; operations are strictly O(log N)',
      'std::unordered_map is a hash table; operations have O(1) average time complexity',
      'std::map requires operator<; std::unordered_map requires a hash function and operator==',
      'The subscript operator map[key] inserts a default value if the key does not exist; prefer find() for read-only lookups',
    ],
    codeExamples: [
      {
        title: 'std::unordered_map Lookup and Insertion',
        language: 'cpp',
        code: `#include <iostream>\n#include <unordered_map>\n#include <string>\n\nint main() {\n    std::unordered_map<std::string, int> wordCounts;\n    wordCounts["c++"] = 15;\n    wordCounts["javascript"] = 25;\n\n    auto it = wordCounts.find("c++");\n    if (it != wordCounts.end()) {\n        std::cout << "Found " << it->first << " with count " << it->second << "\\n";\n    }\n    return 0;\n}`,
        explanation: 'Shows O(1) key lookup in std::unordered_map using the find() iterator pattern.',
      },
    ],
    content: `# std::map vs std::unordered_map

## Decision Matrix
- Need keys sorted in ascending order? Use **std::map**.
- Need maximum raw lookup speed and do not care about ordering? Use **std::unordered_map**.
`,
  },

  // Topics for 'cpp-algorithms-section'
  {
    sectionSlug: 'cpp-algorithms-section',
    title: 'STL Algorithms & Modern Lambdas',
    slug: 'cpp-algorithms-lambdas',
    summary: 'Higher-order operations: std::sort, std::transform, std::accumulate, and lambdas.',
    description:
      'Master functional programming idioms in C++ using algorithms from <algorithm> and lambda closures with capture clauses.',
    duration: '35 mins',
    order: 1,
    keyPoints: [
      'Never write raw loops when an STL algorithm expresses intent more clearly',
      'Lambdas syntax: [captures](params) -> return_type { body }',
      'Captures: [&] captures by reference; [=] captures by value; [val] captures specific variables',
      'Common algorithms: std::sort, std::find_if, std::transform, std::count_if',
    ],
    codeExamples: [
      {
        title: 'Sorting with a Custom Lambda Comparator',
        language: 'cpp',
        code: `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    std::vector<int> numbers = {5, 2, 9, 1, 7};\n\n    // Sort in descending order using an inline lambda\n    std::sort(numbers.begin(), numbers.end(), [](int a, int b) {\n        return a > b;\n    });\n\n    for (int n : numbers) {\n        std::cout << n << " ";\n    }\n    std::cout << "\\n";\n    return 0;\n}`,
        explanation: 'Uses std::sort combined with a C++ lambda expression to sort elements in descending order.',
      },
    ],
    content: `# STL Algorithms & Lambda Expressions

STL algorithms work across any sequence delineated by an iterator pair \`[begin, end)\`.
`,
  },

  // Topics for 'cpp-smart-pointers-section'
  {
    sectionSlug: 'cpp-smart-pointers-section',
    title: 'std::unique_ptr & std::shared_ptr',
    slug: 'cpp-smart-pointers',
    summary: 'Exclusive ownership (unique_ptr) vs reference-counted shared ownership (shared_ptr).',
    description:
      'Eliminate manual memory management and memory leaks using modern C++ smart pointers and make_unique/make_shared.',
    duration: '40 mins',
    order: 1,
    keyPoints: [
      'std::unique_ptr enforces sole ownership; cannot be copied, only moved',
      'std::unique_ptr has ZERO runtime overhead compared to a raw pointer',
      'Always use std::make_unique<T>(...) and std::make_shared<T>(...) rather than raw new',
      'std::shared_ptr uses an atomic reference counter; std::weak_ptr prevents cyclic memory leaks',
    ],
    codeExamples: [
      {
        title: 'std::unique_ptr with std::make_unique',
        language: 'cpp',
        code: `#include <iostream>\n#include <memory>\n\nclass Device {\npublic:\n    Device() { std::cout << "Device initialized\\n"; }\n    ~Device() { std::cout << "Device powered off (automatic cleanup)\\n"; }\n    void ping() { std::cout << "Device ping OK\\n"; }\n};\n\nint main() {\n    {\n        auto dev = std::make_unique<Device>();\n        dev->ping();\n    } // Device automatically destroyed here, 0 leaks!\n    return 0;\n}`,
        explanation: 'Demonstrates leak-free exclusive ownership using std::make_unique and automatic destructor invocation.',
      },
    ],
    content: `# Modern Smart Pointers in C++

In modern C++, you should almost never write \`delete\`.

## 1. \`std::unique_ptr\`
- **Ownership**: Exactly one owner.
- **Overhead**: Identical to a raw pointer (8 bytes on 64-bit platforms).
- **Transfer**: Can only be moved with \`std::move()\`.

## 2. \`std::shared_ptr\`
- **Ownership**: Multiple owners share a control block containing an atomic reference counter.
- **Cleanup**: When the last \`shared_ptr\` is destroyed, the managed object is deallocated.
`,
  },

  // Topics for 'cpp-move-templates-section'
  {
    sectionSlug: 'cpp-move-templates-section',
    title: 'Move Semantics & Rvalue References',
    slug: 'cpp-move-semantics',
    summary: 'Rvalue references (&&), std::move, and eliminating expensive deep copies.',
    description:
      'Understand how C++11 move semantics revolutionized performance by transferring resource ownership from expiring temporaries.',
    duration: '35 mins',
    order: 1,
    keyPoints: [
      'lvalues have identity and an addressable memory location (e.g. named variables)',
      'rvalues are temporary values about to be destroyed (e.g. return values from functions)',
      'An rvalue reference is declared with Type&&',
      'std::move does not move anything itself; it unconditionally casts an lvalue to an rvalue reference to allow moving',
    ],
    codeExamples: [
      {
        title: 'Stealing Buffer with Move Semantics',
        language: 'cpp',
        code: `#include <iostream>\n#include <vector>\n#include <utility>\n\nint main() {\n    std::vector<int> hugeList = {1, 2, 3, 4, 5};\n    std::cout << "Before move: original size = " << hugeList.size() << "\\n";\n\n    // Steal buffer without copying elements\n    std::vector<int> target = std::move(hugeList);\n\n    std::cout << "After move: target size = " << target.size() << "\\n";\n    std::cout << "After move: original size = " << hugeList.size() << "\\n";\n    return 0;\n}`,
        explanation: 'Shows std::move transferring internal buffer pointers in O(1) time without copying vector elements.',
      },
    ],
    content: `# Move Semantics and Rvalue References

Prior to C++11, passing or returning large objects often forced expensive deep copies of buffers. Move semantics allows "stealing" the internal heap pointers from temporary objects.
`,
  },
  {
    sectionSlug: 'cpp-move-templates-section',
    title: 'Templates & Generic Programming',
    slug: 'cpp-templates',
    summary: 'Function templates, class templates, type deduction, and compile-time code generation.',
    description:
      'Write type-safe, generic components using C++ function templates, class templates, and modern template features.',
    duration: '35 mins',
    order: 2,
    keyPoints: [
      'Templates enable writing blueprints for functions and classes that work with any type',
      'Code generation occurs at compile-time (monomorphization), resulting in zero runtime overhead',
      'Template definitions must typically reside in header files so the compiler can instantiate them',
      'Modern C++20 adds concepts to constrain template types with clear compiler errors',
    ],
    codeExamples: [
      {
        title: 'Generic Function and Class Template',
        language: 'cpp',
        code: `#include <iostream>\n\ntemplate <typename T>\nT getMax(T a, T b) {\n    return (a > b) ? a : b;\n}\n\nint main() {\n    std::cout << "Max int: " << getMax(10, 25) << "\\n";\n    std::cout << "Max double: " << getMax(3.14, 2.71) << "\\n";\n    return 0;\n}`,
        explanation: 'Demonstrates a function template that the compiler instantiates for both int and double without duplicate code.',
      },
    ],
    content: `# Templates & Generic Programming in C++

Templates are the mechanism behind the Standard Template Library. They generate optimized machine code specifically for each type used.
`,
  },
];

/* ==========================================================================
   NOTES DATA
   ========================================================================== */

export const cppNotes = [
  {
    topicSlug: 'cpp-variables-types',
    title: 'Deep Dive: Fundamental C++ Types & Sizing',
    slug: 'cpp-types-deep-dive',
    summary: 'An architectural review of integer widths, signed vs unsigned hazards, and floating-point precision.',
    readingTime: '6 mins',
    order: 1,
    tags: ['cpp', 'types', 'memory', 'integers'],
    content: `# C++ Fundamental Types & Sizing

In C++, the language standard defines minimum sizes rather than exact sizes for fundamental types:
- \`char\`: At least 8 bits (usually 1 byte)
- \`short\`: At least 16 bits
- \`int\`: At least 16 bits (32 bits on almost all modern systems)
- \`long\`: At least 32 bits (64 bits on Linux/macOS, 32 bits on 64-bit Windows)
- \`long long\`: At least 64 bits

## The Signed vs Unsigned Trap
Mixing signed and unsigned integers in comparisons or arithmetic is a notorious source of bugs:
\`\`\`cpp
int x = -1;
unsigned int y = 1;
if (x < y) {
    // This will NOT print! x is implicitly promoted to a huge unsigned int!
}
\`\`\`
Always compile with \`-Wall -Wextra\` to let the compiler warn you of signed/unsigned comparisons.
`,
  },
  {
    topicSlug: 'cpp-pointers',
    title: 'Deep Dive: Pointers vs References in C++',
    slug: 'cpp-pointers-vs-references-note',
    summary: 'Comprehensive analysis of pointer indirection, nullability, re-seating, and reference semantics.',
    readingTime: '7 mins',
    order: 1,
    tags: ['cpp', 'pointers', 'references', 'memory'],
    content: `# Pointers vs References: An Architectural Comparison

| Feature | Pointer (\`T*\`) | Reference (\`T&\`) |
| :--- | :--- | :--- |
| **Can be null?** | Yes (\`nullptr\`) | No (must always bind to an existing object) |
| **Re-seating** | Can point to different objects over its lifetime | Cannot be rebound to another object after initialization |
| **Syntax** | Requires \`*\` to dereference and \`->\` for members | Clean \`.\` dot access, identical to direct variables |
| **Storage** | Occupies its own pointer memory address | Usually compiled away or implemented as an immutable pointer |

## Rule of Thumb
- Use **references** by default (especially \`const T&\` for input arguments).
- Use **pointers** only when optionality (nullability) is required, or when building low-level data structures (e.g. linked nodes).
`,
  },
  {
    topicSlug: 'cpp-raii',
    title: 'RAII: The Single Most Important Idiom in Modern C++',
    slug: 'cpp-raii-idiom-note',
    summary: 'Why deterministic destruction and stack unwinding make C++ exceptionally reliable without garbage collection.',
    readingTime: '8 mins',
    order: 1,
    tags: ['cpp', 'raii', 'memory', 'exception-safety'],
    content: `# RAII: Resource Acquisition Is Initialization

Garbage collectors (such as those in Java, C#, or Go) run periodically to reclaim unused heap memory. However, garbage collectors **do not** deterministically manage non-memory resources like:
- File handles
- Database transaction locks
- Thread synchronization mutexes
- Network sockets

## The RAII Solution
In C++, tying resources to stack object lifecycles ensures that as soon as control leaves a block (even due to an unhandled exception), the C++ runtime performs **stack unwinding**: every destructor is executed in reverse order of construction.
`,
  },
  {
    topicSlug: 'cpp-virtual-functions',
    title: 'Behind the Scenes of Vtables and Virtual Dispatch',
    slug: 'cpp-vtables-under-the-hood',
    summary: 'How compilers implement runtime polymorphism using Virtual Method Tables and the vptr pointer.',
    readingTime: '7 mins',
    order: 1,
    tags: ['cpp', 'vtable', 'polymorphism', 'compiler'],
    content: `# How Virtual Dispatch (Vtables) Works

When a class declares at least one \`virtual\` function, the C++ compiler:
1. Generates a hidden **Virtual Method Table (vtable)** for that class containing function pointers to the virtual implementations.
2. Injects a hidden pointer, called the **vptr**, into every instance of the class (usually at offset 0).
3. During constructor execution, initializes \`vptr\` to point to that class's vtable.

## Performance Implication
Calling a virtual function incurs a tiny cost: one pointer indirection through the vtable (\`vptr[index]\`). For 99.9% of application code, this overhead is negligible, but it is why C++ methods are non-virtual by default.
`,
  },
  {
    topicSlug: 'cpp-vector',
    title: 'Under the Hood of std::vector: Growth & Data Locality',
    slug: 'cpp-vector-internals-note',
    summary: 'Why contiguous cache-line alignment makes std::vector the fastest general-purpose container in software.',
    readingTime: '7 mins',
    order: 1,
    tags: ['cpp', 'stl', 'vector', 'performance'],
    content: `# Under the Hood of std::vector

A \`std::vector<T>\` object on the stack typically consists of just **3 pointers** (24 bytes on 64-bit systems):
1. \`begin\`: pointer to the first element in the heap buffer
2. \`end\`: pointer past the last active element
3. \`capacity_end\`: pointer to the end of the allocated memory block

## Cache Locality: The Real Performance Secret
Modern CPUs do not fetch individual bytes from RAM; they load **cache lines** (typically 64 contiguous bytes) into L1/L2 caches.
Because \`std::vector\` stores elements back-to-back in contiguous memory, traversing a vector achieves near 100% cache-line hit rates. In contrast, node-based structures like linked lists scatter nodes across heap memory, triggering expensive cache misses.
`,
  },
  {
    topicSlug: 'cpp-smart-pointers',
    title: 'Mastering Modern Smart Pointers: unique_ptr vs shared_ptr',
    slug: 'cpp-smart-pointers-mastery',
    summary: 'Ownership principles, custom deleters, and cyclic reference prevention with weak_ptr.',
    readingTime: '8 mins',
    order: 1,
    tags: ['cpp', 'smart-pointers', 'memory', 'modern-cpp'],
    content: `# Mastering Smart Pointers

## 1. \`std::unique_ptr<T>\`
- Represents **exclusive ownership**.
- Zero runtime overhead (compiles down to a raw pointer).
- Always use \`std::make_unique<T>(...)\`.

## 2. \`std::shared_ptr<T>\`
- Represents **collaborative shared ownership**.
- Maintains a reference count in an allocated control block.
- Thread-safe increment/decrement of the reference count.

## 3. \`std::weak_ptr<T>\`
- Non-owning observer that points to an object managed by \`std::shared_ptr\`.
- Does not increment the reference count.
- Resolves cyclic reference deadlocks (e.g. Node A -> Node B -> Node A).
`,
  },
  {
    topicSlug: 'cpp-move-semantics',
    title: 'Demystifying Move Semantics and std::move',
    slug: 'cpp-move-semantics-demystified',
    summary: 'Understanding lvalues, prvalues, xvalues, and what std::move actually does at assembly level.',
    readingTime: '8 mins',
    order: 1,
    tags: ['cpp', 'move-semantics', 'rvalues', 'modern-cpp'],
    content: `# Demystifying Move Semantics

## What does \`std::move\` actually do?
Many beginners believe that \`std::move(x)\` moves memory. **It does not!**
At the assembly level, \`std::move\` generates zero CPU instructions. It is purely a compile-time cast:
\`\`\`cpp
// Equivalent to:
static_cast<std::remove_reference_t<T>&&>(t)
\`\`\`
It simply tells the compiler: "Treat this variable as an rvalue so you can call its move constructor instead of its copy constructor."
`,
  },
];

/* ==========================================================================
   PLAYGROUNDS DATA
   ========================================================================== */

export const cppPlaygrounds = [
  {
    topicSlug: 'cpp-pointers',
    title: 'Pointer Arithmetic & Dereferencing',
    slug: 'cpp-pointers-playground',
    description: 'Inspect memory addresses, dereference pointers, and modify underlying values.',
    instructions: `# Challenge: Pointers & Addresses

1. Inspect the given code where pointer 'ptr' points to variable 'number'.
2. Dereference 'ptr' and change the value to 100.
3. Print the updated value to verify the mutation.`,
    initialCode: `#include <iostream>

int main() {
    int number = 42;
    int* ptr = &number;

    std::cout << "Original value: " << number << "\\n";

    // Task: Mutate 'number' through pointer 'ptr' to equal 100
    *ptr = 100;

    std::cout << "Mutated value: " << number << "\\n";
    return 0;
}
`,
    solutionCode: `#include <iostream>

int main() {
    int number = 42;
    int* ptr = &number;

    std::cout << "Original value: " << number << "\\n";

    *ptr = 100;

    std::cout << "Mutated value: " << number << "\\n";
    return 0;
}
`,
    expectedOutput: `Original value: 42\nMutated value: 100`,
    hints: [
      'Use the dereference operator *ptr = 100 to mutate the value in memory.',
      '&number yields the memory address of the integer variable.',
    ],
    language: 'cpp',
    difficulty: 'BEGINNER',
    order: 1,
    published: true,
  },
  {
    topicSlug: 'cpp-references',
    title: 'Pass-by-Reference & In-Place Mutation',
    slug: 'cpp-references-playground',
    description: 'Demonstrate how references avoid copying and allow functions to mutate caller state.',
    instructions: `# Challenge: Pass-by-Reference

1. Implement the doubleValue function using a reference parameter (int& val).
2. Double the value in-place without returning a copy.`,
    initialCode: `#include <iostream>

void doubleValue(int& val) {
    // Task: multiply val by 2 in place
    val *= 2;
}

int main() {
    int score = 50;
    std::cout << "Score before: " << score << "\\n";
    doubleValue(score);
    std::cout << "Score after: " << score << "\\n";
    return 0;
}
`,
    solutionCode: `#include <iostream>

void doubleValue(int& val) {
    val *= 2;
}

int main() {
    int score = 50;
    std::cout << "Score before: " << score << "\\n";
    doubleValue(score);
    std::cout << "Score after: " << score << "\\n";
    return 0;
}
`,
    expectedOutput: `Score before: 50\nScore after: 100`,
    hints: [
      'A reference acts as an alias to the caller argument.',
      'Modifying int& val directly modifies score in the caller frame.',
    ],
    language: 'cpp',
    difficulty: 'BEGINNER',
    order: 1,
    published: true,
  },
  {
    topicSlug: 'cpp-classes',
    title: 'Class Constructor & Destructor Lifecycle',
    slug: 'cpp-classes-playground',
    description: 'Explore member initializer lists and deterministic destructor triggers.',
    instructions: `# Challenge: Member Initializer Lists

1. Inspect the User class constructor and destructor.
2. Observe how the destructor is automatically called when the stack object leaves scope.`,
    initialCode: `#include <iostream>
#include <string>

class User {
private:
    std::string username;

public:
    explicit User(std::string name) : username(name) {
        std::cout << "User " << username << " created\\n";
    }

    ~User() {
        std::cout << "User " << username << " destroyed\\n";
    }

    void greet() const {
        std::cout << "Hello from " << username << "\\n";
    }
};

int main() {
    {
        User u("DevAdmin");
        u.greet();
    }
    std::cout << "Scope completed\\n";
    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>

class User {
private:
    std::string username;

public:
    explicit User(std::string name) : username(name) {
        std::cout << "User " << username << " created\\n";
    }

    ~User() {
        std::cout << "User " << username << " destroyed\\n";
    }

    void greet() const {
        std::cout << "Hello from " << username << "\\n";
    }
};

int main() {
    {
        User u("DevAdmin");
        u.greet();
    }
    std::cout << "Scope completed\\n";
    return 0;
}
`,
    expectedOutput: `User DevAdmin created\nHello from DevAdmin\nUser DevAdmin destroyed\nScope completed`,
    hints: [
      'Destructors are executed in reverse order of declaration when exiting a scope.',
      'Member initializer lists initialize member variables before the constructor body runs.',
    ],
    language: 'cpp',
    difficulty: 'INTERMEDIATE',
    order: 1,
    published: true,
  },
  {
    topicSlug: 'cpp-vector',
    title: 'Vector Manipulation & Algorithms',
    slug: 'cpp-vector-playground',
    description: 'Push elements, inspect capacity, and filter numbers in a dynamic vector.',
    instructions: `# Challenge: std::vector Operations

1. Add elements to the vector and iterate through them.
2. Observe how the capacity increases dynamically.`,
    initialCode: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers;
    numbers.push_back(10);
    numbers.push_back(20);
    numbers.push_back(30);

    for (int num : numbers) {
        std::cout << "Value: " << num << "\\n";
    }

    std::cout << "Total elements: " << numbers.size() << "\\n";
    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers;
    numbers.push_back(10);
    numbers.push_back(20);
    numbers.push_back(30);

    for (int num : numbers) {
        std::cout << "Value: " << num << "\\n";
    }

    std::cout << "Total elements: " << numbers.size() << "\\n";
    return 0;
}
`,
    expectedOutput: `Value: 10\nValue: 20\nValue: 30\nTotal elements: 3`,
    hints: [
      'Use .size() to get current count of items.',
      'Use range-based for (int item : numbers) for clean iteration.',
    ],
    language: 'cpp',
    difficulty: 'INTERMEDIATE',
    order: 1,
    published: true,
  },
  {
    topicSlug: 'cpp-smart-pointers',
    title: 'Exclusive Ownership with std::unique_ptr',
    slug: 'cpp-smart-pointers-playground',
    description: 'Create and transfer exclusive ownership of a heap resource with unique_ptr and std::move.',
    instructions: `# Challenge: Unique Ownership & std::move

1. Inspect std::make_unique.
2. Transfer ownership to another unique_ptr using std::move.`,
    initialCode: `#include <iostream>
#include <memory>
#include <utility>

class Engine {
public:
    Engine() { std::cout << "Engine online\\n"; }
    ~Engine() { std::cout << "Engine offline\\n"; }
    void run() { std::cout << "Engine running smoothly\\n"; }
};

int main() {
    auto p1 = std::make_unique<Engine>();
    p1->run();

    // Transfer ownership from p1 to p2
    auto p2 = std::move(p1);

    if (!p1) {
        std::cout << "p1 is now nullptr (ownership moved)\\n";
    }
    p2->run();
    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <memory>
#include <utility>

class Engine {
public:
    Engine() { std::cout << "Engine online\\n"; }
    ~Engine() { std::cout << "Engine offline\\n"; }
    void run() { std::cout << "Engine running smoothly\\n"; }
};

int main() {
    auto p1 = std::make_unique<Engine>();
    p1->run();

    auto p2 = std::move(p1);

    if (!p1) {
        std::cout << "p1 is now nullptr (ownership moved)\\n";
    }
    p2->run();
    return 0;
}
`,
    expectedOutput: `Engine online\nEngine running smoothly\np1 is now nullptr (ownership moved)\nEngine running smoothly\nEngine offline`,
    hints: [
      'unique_ptr cannot be copied; only moved with std::move().',
      'After a move, the source pointer is set to nullptr.',
    ],
    language: 'cpp',
    difficulty: 'INTERMEDIATE',
    order: 1,
    published: true,
  },
  {
    topicSlug: 'cpp-templates',
    title: 'Generic Function Templates',
    slug: 'cpp-templates-playground',
    description: 'Write a type-agnostic max function template that works on numbers and strings.',
    instructions: `# Challenge: Write a Template Function

1. Create a template function 'findMax(a, b)' that compares two items of type T.
2. Call it with both integers and floating point values.`,
    initialCode: `#include <iostream>

template <typename T>
T findMax(T a, T b) {
    return (a > b) ? a : b;
}

int main() {
    std::cout << "Max int: " << findMax(10, 40) << "\\n";
    std::cout << "Max double: " << findMax(99.5, 42.1) << "\\n";
    return 0;
}
`,
    solutionCode: `#include <iostream>

template <typename T>
T findMax(T a, T b) {
    return (a > b) ? a : b;
}

int main() {
    std::cout << "Max int: " << findMax(10, 40) << "\\n";
    std::cout << "Max double: " << findMax(99.5, 42.1) << "\\n";
    return 0;
}
`,
    expectedOutput: `Max int: 40\nMax double: 99.5`,
    hints: [
      'Use template <typename T> before the function definition.',
      'The compiler deduces T automatically from function arguments.',
    ],
    language: 'cpp',
    difficulty: 'INTERMEDIATE',
    order: 1,
    published: true,
  },
];

/* ==========================================================================
   QUIZZES DATA
   ========================================================================== */

export const cppQuizzes = [
  {
    topicSlug: 'cpp-variables-types',
    title: 'C++ Data Types & Memory Sizing Quiz',
    slug: 'cpp-types-quiz',
    description: 'Test your understanding of C++ static types, fixed widths, and signed/unsigned behaviors.',
    passingScore: 75,
    timeLimitMinutes: 6,
    order: 1,
    published: true,
    questions: [
      {
        question: 'Which header provides fixed-width integer types such as int32_t and uint64_t in C++?',
        options: ['<iostream>', '<cstdint>', '<cstddef>', '<climits>'],
        correctAnswer: 1,
        explanation: '<cstdint> declares exact-width integer types regardless of platform differences.',
        codeSnippet: '#include <cstdint>\nint32_t counter = 0;',
      },
      {
        question: 'What happens when you compare a negative signed integer with an unsigned integer in C++?',
        options: [
          'The compiler throws a compilation error',
          'The signed integer is implicitly converted to unsigned, resulting in a very large positive number',
          'The unsigned integer is converted to signed',
          'The comparison always evaluates to false',
        ],
        correctAnswer: 1,
        explanation: 'According to integer promotion rules, signed values are promoted to unsigned, which can cause subtle logic bugs.',
        codeSnippet: 'int x = -1;\nunsigned int y = 1;\nif (x < y) { /* false! */ }',
      },
      {
        question: 'Which C++ casting operator performs safe compile-time conversions between compatible types?',
        options: ['reinterpret_cast', 'const_cast', 'static_cast', 'dynamic_cast'],
        correctAnswer: 2,
        explanation: 'static_cast is the idiomatic, compiler-checked cast for numeric conversions and related pointer conversions.',
        codeSnippet: 'double d = 3.14;\nint i = static_cast<int>(d);',
      },
    ],
  },
  {
    topicSlug: 'cpp-pointers',
    title: 'C++ Pointers & Memory Addresses Quiz',
    slug: 'cpp-pointers-quiz',
    description: 'Evaluate your knowledge of pointer mechanics, dereferencing, and nullptr safety.',
    passingScore: 75,
    timeLimitMinutes: 6,
    order: 1,
    published: true,
    questions: [
      {
        question: 'What is the correct way to declare a null pointer in Modern C++ (C++11 and newer)?',
        options: ['int* ptr = 0;', 'int* ptr = NULL;', 'int* ptr = nullptr;', 'int* ptr = void;'],
        correctAnswer: 2,
        explanation: 'nullptr has the dedicated type std::nullptr_t, avoiding integer overload ambiguities present with NULL and 0.',
        codeSnippet: '',
      },
      {
        question: 'What is the effect of the following code snippet?',
        options: [
          'It prints the address of a',
          'It changes the value of a to 99',
          'It causes a compilation error',
          'It leaves a unchanged',
        ],
        correctAnswer: 1,
        explanation: 'Dereferencing *p accesses the memory location of a and mutates it directly.',
        codeSnippet: 'int a = 10;\nint* p = &a;\n*p = 99;',
      },
      {
        question: 'What is a "dangling pointer" in C++?',
        options: [
          'A pointer that points to nullptr',
          'A pointer that points to memory that has already been deallocated',
          'A pointer declared without an asterisk',
          'A pointer stored in an array',
        ],
        correctAnswer: 1,
        explanation: 'A dangling pointer points to deallocated or invalid memory; dereferencing it causes undefined behavior.',
        codeSnippet: '',
      },
    ],
  },
  {
    topicSlug: 'cpp-references',
    title: 'C++ References & Const Correctness Quiz',
    slug: 'cpp-references-quiz',
    description: 'Validate your grasp of references, pass-by-const-reference, and immutability.',
    passingScore: 75,
    timeLimitMinutes: 6,
    order: 1,
    published: true,
    questions: [
      {
        question: 'Can a C++ reference be reassigned to bind to another variable after its initialization?',
        options: [
          'Yes, using the address operator',
          'No, references are permanently bound to the object they were initialized with',
          'Only if declared mutable',
          'Only inside class constructors',
        ],
        correctAnswer: 1,
        explanation: 'References cannot be re-seated; attempting assignment (ref = other) simply assigns the value of other to the original referenced variable.',
        codeSnippet: 'int a = 1, b = 2;\nint& ref = a;\nref = b; // mutates a, does not rebind ref!',
      },
      {
        question: 'Why is passing large objects by const reference (const T&) considered best practice in C++?',
        options: [
          'It makes the function execute on a separate CPU thread',
          'It avoids the expensive runtime overhead of copy construction while preventing accidental modifications',
          'It moves ownership of the object into the function',
          'It forces the compiler to allocate the object on the heap',
        ],
        correctAnswer: 1,
        explanation: 'const T& passes an 8-byte pointer under the hood without invoking the copy constructor, while the compiler prevents modifications.',
        codeSnippet: 'void inspect(const std::vector<int>& data);',
      },
    ],
  },
  {
    topicSlug: 'cpp-raii',
    title: 'RAII & Resource Safety Quiz',
    slug: 'cpp-raii-quiz',
    description: 'Test your understanding of deterministic destruction, stack unwinding, and resource encapsulation.',
    passingScore: 75,
    timeLimitMinutes: 6,
    order: 1,
    published: true,
    questions: [
      {
        question: 'When an exception is thrown in C++, what happens to local stack objects as the stack unwinds?',
        options: [
          'They are leaked until the operating system terminates the process',
          'Their destructors are guaranteed to be executed in reverse order of construction',
          'They are moved to heap memory',
          'Only objects marked noexcept are destroyed',
        ],
        correctAnswer: 1,
        explanation: 'Stack unwinding guarantees deterministic destructor execution for all fully constructed automatic objects.',
        codeSnippet: '',
      },
      {
        question: 'Under the RAII paradigm, where should resource acquisition occur?',
        options: [
          'In a separate init() function called after construction',
          'Inside the constructor of the managing class',
          'Inside the destructor',
          'In the global main() entrypoint',
        ],
        correctAnswer: 1,
        explanation: 'Resource Acquisition Is Initialization: acquiring resources in the constructor ensures an object is never in an invalid uninitialized state.',
        codeSnippet: '',
      },
    ],
  },
  {
    topicSlug: 'cpp-virtual-functions',
    title: 'Virtual Functions & Polymorphism Quiz',
    slug: 'cpp-polymorphism-quiz',
    description: 'Verify your understanding of vtables, virtual destructors, and dynamic dispatch.',
    passingScore: 75,
    timeLimitMinutes: 6,
    order: 1,
    published: true,
    questions: [
      {
        question: 'Why MUST a base class have a virtual destructor when deleted through a base pointer?',
        options: [
          'To satisfy the C++ standard library layout requirements',
          'To ensure that the derived class destructor runs and releases derived resources',
          'To make the class copyable',
          'To allow public inheritance',
        ],
        correctAnswer: 1,
        explanation: 'Deleting a derived instance through Base* without a virtual destructor causes undefined behavior and derived destructor omission.',
        codeSnippet: 'Base* b = new Derived();\ndelete b; // Only ~Derived() runs if ~Base() is virtual!',
      },
      {
        question: 'What makes a C++ class "abstract" (cannot be directly instantiated)?',
        options: [
          'Containing private member variables',
          'Having at least one pure virtual function (= 0)',
          'Inheriting from std::exception',
          'Declaring a constructor with the explicit keyword',
        ],
        correctAnswer: 1,
        explanation: 'A pure virtual function (virtual void run() = 0;) makes a class abstract; derived classes must implement it to be instantiable.',
        codeSnippet: 'class Interface {\n    virtual void process() = 0;\n};',
      },
    ],
  },
  {
    topicSlug: 'cpp-smart-pointers',
    title: 'Smart Pointers & Memory Management Quiz',
    slug: 'cpp-smart-pointers-quiz',
    description: 'Evaluate your grasp of unique_ptr, shared_ptr, weak_ptr, and reference cycles.',
    passingScore: 75,
    timeLimitMinutes: 6,
    order: 1,
    published: true,
    questions: [
      {
        question: 'Which smart pointer should be your default choice for managing dynamically allocated heap memory?',
        options: ['std::shared_ptr', 'std::unique_ptr', 'std::auto_ptr', 'std::weak_ptr'],
        correctAnswer: 1,
        explanation: 'std::unique_ptr provides zero-overhead exclusive ownership and should be the default unless shared ownership is strictly required.',
        codeSnippet: '',
      },
      {
        question: 'How do you transfer ownership of an object held by a std::unique_ptr to another unique_ptr?',
        options: [
          'Using the assignment operator (p2 = p1)',
          'Using std::move (p2 = std::move(p1))',
          'Calling p1.clone()',
          'Using static_cast<unique_ptr>',
        ],
        correctAnswer: 1,
        explanation: 'unique_ptr copy constructor is deleted; ownership can only be transferred using move semantics via std::move.',
        codeSnippet: 'auto p2 = std::move(p1);',
      },
      {
        question: 'What is the primary role of std::weak_ptr in modern C++?',
        options: [
          'To provide a pointer that runs faster than unique_ptr',
          'To observe a shared_ptr without increasing its reference count, preventing cyclic memory leaks',
          'To allow writing to read-only memory',
          'To replace raw void* pointers',
        ],
        correctAnswer: 1,
        explanation: 'weak_ptr breaks reference cycles between shared_ptrs by observing without owning or incrementing the control block count.',
        codeSnippet: '',
      },
    ],
  },
  {
    topicSlug: 'cpp-move-semantics',
    title: 'Move Semantics & Rvalues Quiz',
    slug: 'cpp-move-semantics-quiz',
    description: 'Test your understanding of rvalue references, value categories, and std::move.',
    passingScore: 75,
    timeLimitMinutes: 6,
    order: 1,
    published: true,
    questions: [
      {
        question: 'What does the std::move function actually do at runtime?',
        options: [
          'It copies data from the heap to the CPU cache',
          'It unconditionally casts its argument to an rvalue reference (&&) without moving any data itself',
          'It frees the memory of the original object immediately',
          'It locks the mutex of the variable',
        ],
        correctAnswer: 1,
        explanation: 'std::move does not move data; it casts an lvalue to an rvalue reference so the compiler selects the move constructor.',
        codeSnippet: '',
      },
      {
        question: 'What is the state of an object after it has been moved from?',
        options: [
          'It is completely deleted from memory and cannot be accessed',
          'It is in a valid but unspecified state; it can be safely destroyed or assigned to',
          'It retains identical copies of all its original data',
          'Accessing it causes an immediate hardware crash',
        ],
        correctAnswer: 1,
        explanation: 'Standard library types guarantee a moved-from object is in a valid but unspecified state; you can reassign to it or let its destructor run.',
        codeSnippet: '',
      },
    ],
  },
];

/* ==========================================================================
   RESOURCES DATA
   ========================================================================== */

export const cppResources = [
  // cpp-variables-types
  {
    topicSlug: 'cpp-variables-types',
    title: 'cppreference.com: Fundamental C++ Types',
    url: 'https://en.cppreference.com/w/cpp/language/types',
    type: 'DOCUMENTATION',
    description: 'Comprehensive language reference covering byte sizes, signed/unsigned ranges, and integer promotions.',
    author: 'cppreference.com',
    order: 1,
    isFree: true,
  },
  {
    topicSlug: 'cpp-variables-types',
    title: 'LearnCpp.com: Basic Data Types & Fixed-Width Integers',
    url: 'https://www.learncpp.com/cpp-tutorial/fixed-width-integers-and-size-t/',
    type: 'ARTICLE',
    description: 'Practical guide on avoiding platform sizing inconsistencies with int32_t, int64_t, and size_t.',
    author: 'Alex (LearnCpp)',
    order: 2,
    isFree: true,
  },

  // cpp-pointers
  {
    topicSlug: 'cpp-pointers',
    title: 'cppreference.com: Pointer declaration and semantics',
    url: 'https://en.cppreference.com/w/cpp/language/pointer',
    type: 'DOCUMENTATION',
    description: 'Detailed specifications for raw pointers, address operators, null pointer literals, and pointer arithmetic.',
    author: 'cppreference.com',
    order: 1,
    isFree: true,
  },
  {
    topicSlug: 'cpp-pointers',
    title: 'The Cherno: POINTERS in C++',
    url: 'https://www.youtube.com/watch?v=DTxQ447885M',
    type: 'VIDEO',
    description: 'In-depth visual walkthrough of memory addresses, pointer dereferencing, and memory inspector tooling.',
    author: 'The Cherno',
    order: 2,
    isFree: true,
  },

  // cpp-references
  {
    topicSlug: 'cpp-references',
    title: 'cppreference.com: Reference declaration',
    url: 'https://en.cppreference.com/w/cpp/language/reference',
    type: 'DOCUMENTATION',
    description: 'Formal language rules for lvalue references, reference lifetime extension, and const reference rules.',
    author: 'cppreference.com',
    order: 1,
    isFree: true,
  },
  {
    topicSlug: 'cpp-references',
    title: 'ISO C++ Core Guidelines: Concurrency & Const Correctness',
    url: 'https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#con-const-rules',
    type: 'GITHUB',
    description: 'Best practices curated by Bjarne Stroustrup and Herb Sutter on making data immutable by default.',
    author: 'ISO C++ Committee',
    order: 2,
    isFree: true,
  },

  // cpp-classes
  {
    topicSlug: 'cpp-classes',
    title: 'cppreference.com: Classes, Constructors & Initialization',
    url: 'https://en.cppreference.com/w/cpp/language/classes',
    type: 'DOCUMENTATION',
    description: 'Official reference on class definition, member access specifiers, and constructor initializer lists.',
    author: 'cppreference.com',
    order: 1,
    isFree: true,
  },

  // cpp-raii
  {
    topicSlug: 'cpp-raii',
    title: 'cppreference.com: RAII (Resource Acquisition Is Initialization)',
    url: 'https://en.cppreference.com/w/cpp/language/raii',
    type: 'DOCUMENTATION',
    description: 'Technical explanation of how RAII eliminates leaks and guarantees exception safety during stack unwinding.',
    author: 'cppreference.com',
    order: 1,
    isFree: true,
  },
  {
    topicSlug: 'cpp-raii',
    title: 'C++ Weekly with Jason Turner: RAII and Mutex Locks',
    url: 'https://www.youtube.com/watch?v=0hLqPspR6OQ',
    type: 'VIDEO',
    description: 'Practical video demonstrating how std::lock_guard and custom RAII wrappers prevent deadlocks and resource leaks.',
    author: 'Jason Turner',
    order: 2,
    isFree: true,
  },

  // cpp-virtual-functions
  {
    topicSlug: 'cpp-virtual-functions',
    title: 'cppreference.com: Virtual functions & vtable dispatch',
    url: 'https://en.cppreference.com/w/cpp/language/virtual',
    type: 'DOCUMENTATION',
    description: 'Deep dive into virtual method dispatch, pure virtual functions, and the override/final specifiers.',
    author: 'cppreference.com',
    order: 1,
    isFree: true,
  },

  // cpp-vector
  {
    topicSlug: 'cpp-vector',
    title: 'cppreference.com: std::vector container specification',
    url: 'https://en.cppreference.com/w/cpp/container/vector',
    type: 'DOCUMENTATION',
    description: 'Complete API reference for std::vector methods, iterators, capacity modifiers, and time complexity guarantees.',
    author: 'cppreference.com',
    order: 1,
    isFree: true,
  },

  // cpp-smart-pointers
  {
    topicSlug: 'cpp-smart-pointers',
    title: 'cppreference.com: std::unique_ptr and std::shared_ptr',
    url: 'https://en.cppreference.com/w/cpp/memory',
    type: 'DOCUMENTATION',
    description: 'Detailed documentation on modern C++ memory ownership, smart pointer operations, and custom deleters.',
    author: 'cppreference.com',
    order: 1,
    isFree: true,
  },
  {
    topicSlug: 'cpp-smart-pointers',
    title: 'Herb Sutter: Back to the Basics - Smart Pointers',
    url: 'https://www.youtube.com/watch?v=JfmTagWcqoE',
    type: 'VIDEO',
    description: 'Keynote by Herb Sutter explaining when to use unique_ptr vs shared_ptr vs raw non-owning pointers.',
    author: 'CppCon',
    order: 2,
    isFree: true,
  },

  // cpp-move-semantics
  {
    topicSlug: 'cpp-move-semantics',
    title: 'Thomas Becker: C++ Rvalue References Explained',
    url: 'http://thbecker.net/free_software_utilities/type_traits/rvalue_references/part01.html',
    type: 'ARTICLE',
    description: 'Renowned definitive tutorial on understanding move semantics, perfect forwarding, and rvalue references.',
    author: 'Thomas Becker',
    order: 1,
    isFree: true,
  },

  // cpp-templates
  {
    topicSlug: 'cpp-templates',
    title: 'cppreference.com: Templates & Generic Programming',
    url: 'https://en.cppreference.com/w/cpp/language/templates',
    type: 'DOCUMENTATION',
    description: 'Comprehensive manual on template arguments, deduction guides, specialization, and parameter packs.',
    author: 'cppreference.com',
    order: 1,
    isFree: true,
  },
];

/* ==========================================================================
   INTERVIEW QUESTIONS DATA
   ========================================================================== */

export const cppInterviewQuestions = [
  {
    topicSlug: 'cpp-pointers',
    question: 'What are the key differences between a pointer and a reference in C++?',
    answer: `In C++, both pointers and references allow indirect access to memory, but they have fundamental syntactic and semantic differences:

1. **Nullability**:
   - A pointer can be \`nullptr\`, signifying that it points to nothing.
   - A reference MUST be bound to a valid object upon creation and cannot be null.

2. **Re-assignment (Re-seating)**:
   - A pointer can be reassigned to point to different memory addresses throughout its lifetime.
   - A reference is permanently bound to its initial target; subsequent assignments modify the referenced value, not the reference itself.

3. **Memory & Syntax**:
   - A pointer has its own distinct address and occupies 4 or 8 bytes of storage. It requires dereferencing (\`*p\`) or arrow (\`p->\`) operators.
   - A reference acts as an exact alias for the target object, using standard dot syntax (\`ref.method()\`). Compilers frequently optimize references away entirely into direct registers.`,
    codeSnippet: `int a = 10, b = 20;

// Pointer:
int* p = &a;
p = &b; // OK: p now points to b

// Reference:
int& r = a;
r = b;  // Does NOT rebind r! Instead, copies b's value into a (a is now 20).`,
    difficulty: 'INTERMEDIATE',
    frequency: 'FREQUENT',
    order: 1,
    tags: ['pointers', 'references', 'memory', 'fundamentals'],
    published: true,
  },
  {
    topicSlug: 'cpp-references',
    question: 'Explain const correctness and the difference between const int*, int* const, and const int* const.',
    answer: `Const correctness is the practice of using the \`const\` keyword to ensure that immutable variables, pointers, and class members cannot be accidentally modified.

The placement of \`const\` relative to the asterisk determines what is constant:

1. **\`const int* ptr\` (or \`int const* ptr\`)**:
   - **Pointer to constant integer**.
   - The *value* being pointed to cannot be modified through this pointer (\`*ptr = 10\` is illegal).
   - The *pointer itself* can be changed to point to another memory address (\`ptr = &other\` is allowed).

2. **\`int* const ptr\`**:
   - **Constant pointer to an integer**.
   - The pointer is fixed to one address forever (\`ptr = &other\` is illegal).
   - The *value* at that address can be modified (\`*ptr = 10\` is allowed).

3. **\`const int* const ptr\`**:
   - **Constant pointer to a constant integer**.
   - Neither the pointer address nor the pointed-to value can be modified.`,
    codeSnippet: `int val = 5, other = 10;

const int* p1 = &val;
// *p1 = 20; // ❌ Compile error: assignment of read-only location
p1 = &other; // ✅ Valid: pointer address changed

int* const p2 = &val;
*p2 = 20;    // ✅ Valid: value mutated
// p2 = &other; // ❌ Compile error: assignment of read-only variable`,
    difficulty: 'INTERMEDIATE',
    frequency: 'FREQUENT',
    order: 2,
    tags: ['const', 'pointers', 'immutability'],
    published: true,
  },
  {
    topicSlug: 'cpp-raii',
    question: 'What is RAII (Resource Acquisition Is Initialization) and why does it make C++ exception-safe without a garbage collector?',
    answer: `**RAII (Resource Acquisition Is Initialization)** is the foundational design pattern in C++ that binds the lifecycle of system resources to the lifetime of stack objects.

### Core Mechanics:
1. **Acquisition**: A resource (heap memory, POSIX file descriptor, database lock, socket) is acquired in the class constructor.
2. **Release**: The resource is released in the class destructor (\`~ClassName()\`).
3. **Deterministic Scope Exit**: When an automatic (stack) object leaves its scope—whether through normal completion (\`return\`, \`break\`) or due to an exception being thrown—the C++ runtime triggers **stack unwinding**.

### Why it Eliminates Garbage Collection:
- Unlike garbage collection which operates intermittently and indeterminately, RAII frees resources at the exact microsecond they fall out of scope.
- In languages like Java or Python, developers rely on \`try...finally\` blocks to clean up non-memory handles. In C++, RAII destructors run automatically, guaranteeing 100% exception safety without boilerplate.`,
    codeSnippet: `void processFile(const std::string& path) {
    // std::ifstream uses RAII: opens file in constructor
    std::ifstream file(path);

    if (!file.is_open()) throw std::runtime_error("File error");

    // Even if doDangerousCalculation() throws, 'file' is guaranteed
    // to be closed immediately during stack unwinding!
    doDangerousCalculation(file);
}`,
    difficulty: 'INTERMEDIATE',
    frequency: 'FREQUENT',
    order: 3,
    tags: ['raii', 'memory', 'exception-safety'],
    published: true,
  },
  {
    topicSlug: 'cpp-virtual-functions',
    question: 'Why must a base class destructor always be declared virtual in an inheritance hierarchy?',
    answer: `If a class is designed to be inherited from and used polymorphically, its destructor MUST be declared \`virtual\`.

### What happens if the destructor is non-virtual?
When you delete a derived class instance through a pointer to the base class (\`Base* ptr = new Derived(); delete ptr;\`), the compiler inspects the static type of the pointer (\`Base*\`).
- If \`~Base()\` is **non-virtual**, the compiler generates an ordinary non-virtual call to \`~Base()\`.
- The derived class destructor \`~Derived()\` is **NEVER called**.
- According to the C++ Standard, this results in **Undefined Behavior (UB)** and causes serious memory or resource leaks (e.g. any members allocated by \`Derived\` are leaked).

### The Fix:
Declaring \`virtual ~Base() = default;\` causes the runtime to look up the destructor in the vtable, ensuring that \`~Derived()\` runs first, followed by \`~Base()\`.`,
    codeSnippet: `class Base {
public:
    virtual ~Base() = default; // ✅ Virtual destructor ensures clean destruction
};

class Derived : public Base {
private:
    int* buffer;
public:
    Derived() : buffer(new int[1000]) {}
    ~Derived() override { delete[] buffer; } // Guaranteed to run!
};`,
    difficulty: 'INTERMEDIATE',
    frequency: 'FREQUENT',
    order: 4,
    tags: ['inheritance', 'virtual', 'destructors', 'memory-leaks'],
    published: true,
  },
  {
    topicSlug: 'cpp-virtual-functions',
    question: 'What is object slicing in C++ and how do you prevent it?',
    answer: `**Object slicing** occurs when a derived class instance is assigned to or passed by value into a base class variable.

### The Mechanism:
Because a base class object only has enough memory storage for the base class members, the derived-specific portion of the object is literally "sliced off" and discarded. The resulting object becomes an ordinary \`Base\` instance; all polymorphic virtual method dispatch is lost.

### How to Prevent Slicing:
1. Always pass objects in polymorphic hierarchies **by reference** (\`const Base&\`) or **by pointer** (\`Base*\`).
2. Use smart pointers (\`std::unique_ptr<Base>\` or \`std::shared_ptr<Base>\`).
3. If appropriate, declare base classes abstract with at least one pure virtual function, preventing base instantiation by value.`,
    codeSnippet: `class Base { public: virtual void print() { std::cout << "Base\\n"; } };
class Derived : public Base { public: void print() override { std::cout << "Derived\\n"; } };

void problem(Base b) { b.print(); } // ❌ Object sliced! Prints "Base"
void solution(const Base& b) { b.print(); } // ✅ Passed by reference! Prints "Derived"`,
    difficulty: 'ADVANCED',
    frequency: 'COMMON',
    order: 5,
    tags: ['polymorphism', 'slicing', 'inheritance'],
    published: true,
  },
  {
    topicSlug: 'cpp-vector',
    question: 'What happens when std::vector exceeds its capacity, and why does reallocation invalidate existing iterators and references?',
    answer: `A \`std::vector\` stores its elements in a single contiguous dynamic array on the heap.

### Reallocation Steps:
When \`push_back()\` or \`emplace_back()\` is called and \`size() == capacity()\`:
1. The vector requests a new heap block from the allocator, typically **1.5x (MSVC)** or **2x (GCC / Clang)** larger than the current capacity.
2. The vector moves (or copies if move constructors are not \`noexcept\`) all existing elements from the old buffer to the new buffer.
3. The newly added element is constructed at the end of the new buffer.
4. The old memory buffer is deallocated.

### Iterator & Reference Invalidation:
Because the entire array has relocated to a completely different memory address, **any raw pointer, reference, or iterator pointing to elements in the old array now points to deallocated memory (dangling pointer)**. Dereferencing them causes undefined behavior.

### Optimization:
Call \`vec.reserve(expectedCount)\` beforehand if the number of elements is known to eliminate multiple reallocations.`,
    codeSnippet: `std::vector<int> v = {1, 2, 3};
int& firstRef = v[0]; // Reference to first element

// Capacity was 3; adding 4th element triggers reallocation!
v.push_back(4);

// ❌ DANGEROUS: firstRef is now a dangling reference pointing to freed memory!
// std::cout << firstRef << std::endl;`,
    difficulty: 'INTERMEDIATE',
    frequency: 'FREQUENT',
    order: 6,
    tags: ['stl', 'vector', 'iterators', 'capacity'],
    published: true,
  },
  {
    topicSlug: 'cpp-smart-pointers',
    question: 'Explain the difference between std::unique_ptr, std::shared_ptr, and std::weak_ptr. How does std::weak_ptr prevent cyclic memory leaks?',
    answer: `Modern C++ provides three smart pointer types to represent distinct ownership models:

1. **\`std::unique_ptr<T>\`**:
   - Represents **exclusive, non-shared ownership**.
   - Cannot be copied; only moved with \`std::move()\`.
   - Has zero runtime overhead compared to a raw pointer.

2. **\`std::shared_ptr<T>\`**:
   - Represents **collaborative shared ownership**.
   - Maintains a heap control block containing an atomic reference counter.
   - When the last \`shared_ptr\` pointing to the resource is destroyed, the resource is deallocated.

3. **\`std::weak_ptr<T>\` & Cyclic Leaks**:
   - If two \`shared_ptr\` objects hold strong references to each other (e.g. Node A -> Node B and Node B -> Node A), their reference counts can never drop to zero, creating a **cyclic memory leak**.
   - \`std::weak_ptr\` provides a non-owning observer: it monitors an object managed by \`std::shared_ptr\` without incrementing the reference count.
   - To access the object, you call \`weak.lock()\`, which returns a valid \`shared_ptr\` if the object is still alive, or \`nullptr\` if it has been destroyed.`,
    codeSnippet: `struct Node {
    std::shared_ptr<Node> next;
    std::weak_ptr<Node> prev; // ✅ weak_ptr avoids reference cycle with 'next'!
};`,
    difficulty: 'ADVANCED',
    frequency: 'FREQUENT',
    order: 7,
    tags: ['smart-pointers', 'memory', 'modern-cpp'],
    published: true,
  },
  {
    topicSlug: 'cpp-move-semantics',
    question: 'What is std::move, what are rvalue references (&&), and how does move semantics improve performance?',
    answer: `Prior to C++11, passing or returning large objects caused expensive deep copying of internal memory buffers. Move semantics solves this by allowing resources to be transferred ("stolen") from temporary objects that are about to expire.

### 1. Value Categories:
- **lvalue**: An expression that designates a named, persistent memory location (e.g. \`int x = 10;\`, variable \`x\`).
- **rvalue**: A temporary value that does not persist beyond the expression that created it (e.g. \`10\`, \`x + 5\`, or function return value).

### 2. Rvalue References (\`T&&\`):
An rvalue reference binds exclusively to temporary objects (rvalues), allowing a function or constructor to know it is safe to scavenge their internal pointers.

### 3. What \`std::move\` Does:
\`std::move(var)\` performs an unconditional cast of an lvalue to an rvalue reference (\`static_cast<T&&>(var)\`). It does not move any memory itself; it signals to the compiler that \`var\` can be moved from by invoking its move constructor or move assignment operator.`,
    codeSnippet: `std::vector<int> createLargeVector() {
    std::vector<int> v(1000000, 42);
    return v; // Modern C++ automatically moves return value (or applies RVO)
}

std::vector<int> target = createLargeVector(); // 0 elements copied! Internal buffer pointer swapped.`,
    difficulty: 'ADVANCED',
    frequency: 'FREQUENT',
    order: 8,
    tags: ['move-semantics', 'rvalues', 'performance'],
    published: true,
  },
];

/* ==========================================================================
   MAIN SEED RUNNER FUNCTION
   ========================================================================== */

export async function seedCpp(disconnectAfter = false) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learning_hub';
  if (mongoose.connection.readyState === 0) {
    console.log(`[Seed C++] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
  }

  console.log('============================================================');
  console.log('         STARTING STANDALONE C++ CURRICULUM SEED            ');
  console.log('============================================================');

  // 1. Seed Learning Path
  console.log(`\n[1/9] Seeding Learning Path: '${cppLearningPath.title}'...`);
  let pathDoc = await LearningPath.findOne({ slug: cppLearningPath.slug });
  if (pathDoc) {
    console.log(` -> Updating existing Learning Path (${cppLearningPath.slug})`);
    pathDoc = await LearningPath.findByIdAndUpdate(
      pathDoc._id,
      { ...cppLearningPath, published: true },
      { new: true }
    );
  } else {
    console.log(` -> Creating new Learning Path (${cppLearningPath.slug})`);
    pathDoc = await LearningPath.create(cppLearningPath);
  }

  // 2. Seed Modules
  console.log(`\n[2/9] Seeding Modules for C++...`);
  const moduleMap = new Map();
  for (const m of cppModules) {
    const modData = {
      learningPath: pathDoc._id,
      title: m.title,
      slug: m.slug,
      description: m.description,
      duration: m.duration,
      order: m.order,
      topics: m.topics,
      learningObjectives: m.learningObjectives,
      published: true,
    };
    let modDoc = await Module.findOne({ slug: m.slug });
    if (modDoc) {
      modDoc = await Module.findByIdAndUpdate(modDoc._id, modData, { new: true });
      console.log(` -> Updated module: ${m.title} (${m.slug})`);
    } else {
      modDoc = await Module.create(modData);
      console.log(` -> Created module: ${m.title} (${m.slug})`);
    }
    moduleMap.set(m.slug, modDoc);
  }

  // 3. Seed Sections
  console.log(`\n[3/9] Seeding Sections for C++...`);
  const sectionMap = new Map();
  for (const s of cppSections) {
    const parentModule = moduleMap.get(s.moduleSlug);
    if (!parentModule) {
      console.warn(` [!] Warning: Parent module '${s.moduleSlug}' not found for section '${s.slug}'`);
      continue;
    }
    const secData = {
      module: parentModule._id,
      title: s.title,
      slug: s.slug,
      description: s.description,
      duration: s.duration,
      order: s.order,
      items: s.items,
      content: s.content,
      published: true,
    };
    let secDoc = await Section.findOne({ slug: s.slug });
    if (secDoc) {
      secDoc = await Section.findByIdAndUpdate(secDoc._id, secData, { new: true });
      console.log(` -> Updated section: ${s.title} (${s.slug})`);
    } else {
      secDoc = await Section.create(secData);
      console.log(` -> Created section: ${s.title} (${s.slug})`);
    }
    sectionMap.set(s.slug, secDoc);
  }

  // 4. Seed Topics
  console.log(`\n[4/9] Seeding Topics for C++...`);
  const topicMap = new Map();
  for (const t of cppTopics) {
    const parentSection = sectionMap.get(t.sectionSlug);
    if (!parentSection) {
      console.warn(` [!] Warning: Parent section '${t.sectionSlug}' not found for topic '${t.slug}'`);
      continue;
    }
    const topicData = {
      section: parentSection._id,
      title: t.title,
      slug: t.slug,
      summary: t.summary,
      description: t.description,
      duration: t.duration,
      order: t.order,
      keyPoints: t.keyPoints,
      codeExamples: t.codeExamples,
      content: t.content,
      published: true,
    };
    let topDoc = await Topic.findOne({ slug: t.slug });
    if (topDoc) {
      topDoc = await Topic.findByIdAndUpdate(topDoc._id, topicData, { new: true });
      console.log(` -> Updated topic: ${t.title} (${t.slug})`);
    } else {
      topDoc = await Topic.create(topicData);
      console.log(` -> Created topic: ${t.title} (${t.slug})`);
    }
    topicMap.set(t.slug, topDoc);
  }

  // 5. Seed Notes
  console.log(`\n[5/9] Seeding In-Depth Notes for C++...`);
  let notesCount = 0;
  for (const n of cppNotes) {
    const parentTopic = topicMap.get(n.topicSlug);
    if (!parentTopic) {
      console.warn(` [!] Warning: Parent topic '${n.topicSlug}' not found for note '${n.slug}'`);
      continue;
    }
    const noteData = {
      topic: parentTopic._id,
      title: n.title,
      slug: n.slug,
      summary: n.summary,
      content: n.content,
      readingTime: n.readingTime,
      order: n.order,
      tags: n.tags,
      published: true,
    };
    const existing = await Note.findOne({ slug: n.slug });
    if (existing) {
      await Note.findByIdAndUpdate(existing._id, noteData, { new: true });
    } else {
      await Note.create(noteData);
    }
    notesCount++;
  }
  console.log(` -> Successfully upserted ${notesCount} C++ notes.`);

  // 6. Seed Playgrounds
  console.log(`\n[6/9] Seeding Interactive Playgrounds for C++...`);
  let pgCount = 0;
  for (const p of cppPlaygrounds) {
    const parentTopic = topicMap.get(p.topicSlug);
    if (!parentTopic) {
      console.warn(` [!] Warning: Parent topic '${p.topicSlug}' not found for playground '${p.slug}'`);
      continue;
    }
    const pgData = {
      topic: parentTopic._id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      instructions: p.instructions,
      initialCode: p.initialCode,
      solutionCode: p.solutionCode,
      expectedOutput: p.expectedOutput,
      hints: p.hints,
      language: p.language,
      difficulty: p.difficulty,
      order: p.order,
      published: true,
    };
    const existing = await Playground.findOne({ slug: p.slug });
    if (existing) {
      await Playground.findByIdAndUpdate(existing._id, pgData, { new: true });
    } else {
      await Playground.create(pgData);
    }
    pgCount++;
  }
  console.log(` -> Successfully upserted ${pgCount} C++ playgrounds.`);

  // 7. Seed Quizzes
  console.log(`\n[7/9] Seeding Knowledge Check Quizzes for C++...`);
  let quizCount = 0;
  for (const q of cppQuizzes) {
    const parentTopic = topicMap.get(q.topicSlug);
    if (!parentTopic) {
      console.warn(` [!] Warning: Parent topic '${q.topicSlug}' not found for quiz '${q.slug}'`);
      continue;
    }
    const quizData = {
      topic: parentTopic._id,
      title: q.title,
      slug: q.slug,
      description: q.description,
      passingScore: q.passingScore,
      timeLimitMinutes: q.timeLimitMinutes,
      order: q.order,
      published: true,
      questions: q.questions,
    };
    const existing = await Quiz.findOne({ slug: q.slug });
    if (existing) {
      await Quiz.findByIdAndUpdate(existing._id, quizData, { new: true });
    } else {
      await Quiz.create(quizData);
    }
    quizCount++;
  }
  console.log(` -> Successfully upserted ${quizCount} C++ quizzes.`);

  // 8. Seed Resources
  console.log(`\n[8/9] Seeding Curated Resources for C++...`);
  let resCount = 0;
  for (const r of cppResources) {
    const parentTopic = topicMap.get(r.topicSlug);
    if (!parentTopic) {
      console.warn(` [!] Warning: Parent topic '${r.topicSlug}' not found for resource '${r.title}'`);
      continue;
    }
    const resData = {
      topic: parentTopic._id,
      title: r.title,
      url: r.url,
      type: r.type,
      description: r.description,
      author: r.author,
      order: r.order,
      isFree: r.isFree,
    };
    const existing = await Resource.findOne({ topic: parentTopic._id, url: r.url });
    if (existing) {
      await Resource.findByIdAndUpdate(existing._id, resData, { new: true });
    } else {
      await Resource.create(resData);
    }
    resCount++;
  }
  console.log(` -> Successfully upserted ${resCount} C++ resources.`);

  // 9. Seed Interview Questions
  console.log(`\n[9/9] Seeding Technical Interview Questions for C++...`);
  let iqCount = 0;
  for (const iq of cppInterviewQuestions) {
    const parentTopic = topicMap.get(iq.topicSlug);
    if (!parentTopic) {
      console.warn(` [!] Warning: Parent topic '${iq.topicSlug}' not found for interview question`);
      continue;
    }
    const iqData = {
      topic: parentTopic._id,
      question: iq.question,
      answer: iq.answer,
      codeSnippet: iq.codeSnippet,
      difficulty: iq.difficulty,
      frequency: iq.frequency,
      order: iq.order,
      tags: iq.tags,
      published: true,
    };
    const existing = await InterviewQuestion.findOne({ topic: parentTopic._id, question: iq.question });
    if (existing) {
      await InterviewQuestion.findByIdAndUpdate(existing._id, iqData, { new: true });
    } else {
      await InterviewQuestion.create(iqData);
    }
    iqCount++;
  }
  console.log(` -> Successfully upserted ${iqCount} C++ interview questions.`);

  console.log('\n============================================================');
  console.log('             C++ CURRICULUM SEED COMPLETE                   ');
  console.log('============================================================');
  console.log(` Learning Paths      : 1 (${cppLearningPath.slug})`);
  console.log(` Modules             : ${cppModules.length}`);
  console.log(` Sections            : ${cppSections.length}`);
  console.log(` Topics              : ${cppTopics.length}`);
  console.log(` Notes               : ${notesCount}`);
  console.log(` Playgrounds         : ${pgCount}`);
  console.log(` Quizzes             : ${quizCount}`);
  console.log(` Resources           : ${resCount}`);
  console.log(` Interview Questions : ${iqCount}`);
  console.log('============================================================\n');

  if (disconnectAfter) {
    await mongoose.disconnect();
  }
}

// Execute if run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedCpp.js')) {
  seedCpp(true)
    .then(() => {
      console.log('[Seed C++] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed C++ Error]:', err);
      process.exit(1);
    });
}
