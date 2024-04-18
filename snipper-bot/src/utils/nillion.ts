import axios  from 'axios';

import { nillionError } from '@/types/customError';

const config = require('../config.json');

export const computeOnNillion = async (id: string) => {

  const store_id = {"store_id": id}
  console.log(`${config.baseUrl}/computations/thrombosis`, store_id)

  try {
      const response = await axios.post(`${config.baseUrl}/computations/thrombosis`, store_id, {
          headers: {
              'Content-Type': 'application/json',
          }
      });

      console.log('Server response:', response.data);
      const { Result } = response.data;
      return Result;
  } catch (error) {
      console.error('Error uploading file on Nillion:', error);
      throw nillionError;
  }
};
