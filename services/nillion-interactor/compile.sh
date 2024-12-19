#!/usr/bin/env bash


echo "Compiling thrombosis.py"
time pynadac --target-dir binaries --generate-mir-json programs/thrombosis.py

echo "Compiling muscle-perform.py"
time pynadac --target-dir binaries --generate-mir-json programs/muscle-perform.py

# echo "Compiling muscle-perform-array.py"
# time pynadac --target-dir binaries --generate-mir-json programs/muscle-perform-array.py

echo "Compiling double.py"
time pynadac --target-dir binaries --generate-mir-json programs/double.py
