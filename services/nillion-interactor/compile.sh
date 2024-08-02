#!/usr/bin/env bash


echo "Compiling thrombosis.py"
pynadac --target-dir binaries --generate-mir-json programs/thrombosis.py

echo "Compiling muscle-perform.py"
pynadac --target-dir binaries --generate-mir-json programs/muscle-perform.py

echo "Compiling double.py"
pynadac --target-dir binaries --generate-mir-json /tmp/double.py
