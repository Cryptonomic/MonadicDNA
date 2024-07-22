# Creates a binary file for test_api.sh

# Create a simple text file
echo "This is a sample dataset" > sample.txt

# Convert the text file to binary
if command -v xxd &> /dev/null
then
    xxd -p sample.txt | xxd -p -r > data.bin
else
    # Alternative method if xxd is not available
    od -An -tx1 < sample.txt | tr -d ' \n' | sed 's/../\\x&/g' | xargs printf > data.bin
fi

# Verify the contents of the binary file
hexdump -C data.bin

# Clean up the temporary text file
rm sample.txt
