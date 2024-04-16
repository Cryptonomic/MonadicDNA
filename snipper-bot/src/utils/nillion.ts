import axios from 'axios';

// curl -i -X PUT -F "file=@testdata/hu278AF5_20210124151934.txt" https://165.232.74.173:8732/dataset
const config = require('../config.json');

export const computeOnNillion = async (id: string) => {
//   const gg = {"store_id": "afeca0ed-570a-437e-a638-c56e0a0d52e8"}

  const store_id = {"store_id": id}

  try {
      const response = await axios.post(`${config.baseUrl}/computations/thrombosis`, store_id, {
          headers: {
              'Content-Type': 'application/json',
            //   'Access-Control-Allow-Origin': 'http://localhost:3000/'
          }
      });

      console.log('Server response:', response.data);
      const { Result } = response.data;
      return Result;
  } catch (error) {
      console.error('Error uploading file on Nillion:', error);
  }
};
