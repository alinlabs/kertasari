/**
 * API Service Handler
 * Digunakan untuk melakukan routing fetch data (GET, POST, PUT, DELETE) ke backend Cloudflare Worker.
 */

import { logger } from './logger';

const API_BASE_URL = 'https://app.kppm-kertasari.workers.dev/api';

export const api = {
  /**
   * Mengambil semua data dari endpoint (GET)
   * Contoh pemakaian: api.get('agenda')
   */
  async get<T = any>(endpoint: string): Promise<T> {
    try {
      logger.info(`Memulai request GET ke Cloudflare API untuk endpoint: ${endpoint}`);
      const response = await fetch(`${API_BASE_URL}/${endpoint}`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status} saat GET ${endpoint}`);
      const data = await response.json() as T;
      logger.success(`Berhasil fetch dari API cloudflare untuk endpoint: ${endpoint}`);
      return data;
    } catch (error) {
      logger.error(`Gagal fetch dari API cloudflare untuk endpoint ${endpoint}`, error);
      throw error;
    }
  },

  /**
   * Mengambil spesifik data berdasarkan ID (GET)
   * Contoh pemakaian: api.getById('agenda', '1')
   */
  async getById<T = any>(endpoint: string, id: string): Promise<T> {
    try {
      logger.info(`Memulai request GET (by ID) ke Cloudflare API untuk endpoint: ${endpoint}/${id}`);
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status} saat GET ${endpoint} (${id})`);
      const data = await response.json() as T;
      logger.success(`Berhasil fetch dari API cloudflare untuk endpoint: ${endpoint}/${id}`);
      return data;
    } catch (error) {
      logger.error(`Gagal fetch dari API cloudflare untuk endpoint ${endpoint}/${id}`, error);
      throw error;
    }
  },

  /**
   * Mengirim / membuat data baru (POST)
   * Contoh pemakaian: api.post('agenda', { judul: 'Rapat', tanggal: '2026-07-01' })
   */
  async post<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      logger.info(`Memulai request POST ke Cloudflare API untuk endpoint: ${endpoint}`, data);
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status} saat POST ${endpoint}`);
      const result = await response.json() as T;
      logger.success(`Berhasil POST ke API cloudflare untuk endpoint: ${endpoint}`, data);
      return result;
    } catch (error) {
      logger.error(`Gagal POST ke API cloudflare untuk endpoint: ${endpoint}`, error);
      throw error;
    }
  },

  /**
   * Memperbarui data yang ada berdasarkan ID (PUT)
   * Contoh pemakaian: api.put('agenda', '1', { judul: 'Rapat Diubah' })
   */
  async put<T = any>(endpoint: string, id: string, data: any): Promise<T> {
    try {
      logger.info(`Memulai request PUT ke Cloudflare API untuk endpoint: ${endpoint}/${id}`, data);
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status} saat PUT ${endpoint} (${id})`);
      const result = await response.json() as T;
      logger.success(`Berhasil PUT ke API cloudflare untuk endpoint: ${endpoint}/${id}`, data);
      return result;
    } catch (error) {
      logger.error(`Gagal PUT ke API cloudflare untuk endpoint: ${endpoint}/${id}`, error);
      throw error;
    }
  },

  /**
   * Menghapus data berdasarkan ID (DELETE)
   * Contoh pemakaian: api.delete('agenda', '1')
   */
  async delete<T = any>(endpoint: string, id: string): Promise<T> {
    try {
      logger.info(`Memulai request DELETE ke Cloudflare API untuk endpoint: ${endpoint}/${id}`);
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status} saat DELETE ${endpoint} (${id})`);
      const result = await response.json() as T;
      logger.success(`Berhasil DELETE ke API cloudflare untuk endpoint: ${endpoint}/${id}`);
      return result;
    } catch (error) {
      logger.error(`Gagal DELETE dari API cloudflare untuk endpoint: ${endpoint}/${id}`, error);
      throw error;
    }
  }
};
