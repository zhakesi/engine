#include <emscripten/emscripten.h>
#include <emscripten/bind.h>

using namespace emscripten;

class Person {
public:
    int age;
};

EMSCRIPTEN_BINDINGS(spine) {
    class_<Person>("Person")
        .property("age", &Person::age, &Person::age);
}