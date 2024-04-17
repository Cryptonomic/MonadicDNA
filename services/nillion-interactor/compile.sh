#!/usr/bin/env bash

pynadac --target-dir binaries --generate-mir-json programs/thrombosis.py
pynadac --target-dir binaries --generate-mir-json programs/muscle-perform.py 