#ifndef Spine_Vector2_h
#define Spine_Vector2_h
#include <math.h>
#include <spine/SpineObject.h>
namespace spine {
class SP_API Vector2 : public SpineObject {
public:
        float x, y;
public:
    Vector2(float _x, float _y): x(_x), y(_y) {

    }
    inline Vector2 &set(float _x, float _y) {
        x = _x;
        y = _y;
        return *this;
    }
    inline float length () {
        return sqrtf(x * x + y * y);
    }
    inline Vector2 &normalize () {
        float len = length();
		if (len != 0) {
			x /= len;
			y /= len;
		}        
        return *this;
    }
};
}
#endif
