# Test script for the server

echo "*****Submitting a dataset*****"
curl -v -X PUT -H "Content-Type: application/octet-stream" --data-binary @data.bin "http://localhost:6174/dataset?user_id=user123"

echo "*****Fetching the dataset*****"
curl -v "http://localhost:6174/dataset?user_id=user123" --output retrieved_data.bin

echo "*****Obtaining a thrombosis result*****"
curl -v "http://localhost:6174/thrombosis?user_id=user123"

echo "*****Obtaining a frequency result*****"
curl -v "http://localhost:6174/frequencies?user_id=user123"
