#include <stdarg.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>

char *rust_hello(const char *to);

void rust_hello_free(char *s);


// Function to add two integers
int add_numbers(int a, int b);

// Function to generate a key, returning a pointer to a C string (const u8 in Rust maps to const char in C)
const char* generate_keys();

