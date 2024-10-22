import { api } from './api/nocodb.ts';

export async function getData(tableName: string, query: object = {}) {
  try {
    const response = await api.get(`/api/v1/table/${tableName}/list`, { params: query });
    console.log(response.data);
    return response.data;
    
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export async function insertData(tableName: string, data: object) {
  try {
    const response = await api.post(`/api/v1/table/${tableName}/insert`, data);
    return response.data;
  } catch (error) {
    console.error('Error inserting data:', error);
    throw error;
  }
}

export async function deleteData(tableName: string, rowId: string) {
  try {
    const response = await api.delete(`/api/v1/table/${tableName}/${rowId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting data:', error);
    throw error;
  }
}