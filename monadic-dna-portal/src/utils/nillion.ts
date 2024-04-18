import axios from 'axios';

const config = require('../config.json');

export async function storeOnNillion(file: File) {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.put(`${config.baseUrl}/dataset`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        console.log('Server response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}