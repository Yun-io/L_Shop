import fs from 'fs/promises';
import path from 'path';

/**
 * Утилитарный класс для работы с JSON файлами как с базой данных.
 * @template T Тип данных, хранящихся в базе.
 */
export class JsonDB<T> {
  private filePath: string;

  /**
   * Создает экземпляр JsonDB.
   * @param {string} fileName - Имя файла (например, 'products.json').
   */
  constructor(fileName: string) {
    this.filePath = path.join(process.cwd(), 'data', fileName);
  }

  /**
   * Асинхронно читает все данные из JSON файла.
   * @returns {Promise<T[]>} Промис, разрешающийся массивом элементов типа T.
   */
  async readAll(): Promise<T[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      await this.writeAll([]);
      return [];
    }
  }

  /**
   * Асинхронно записывает массив данных в JSON файл.
   * @param {T[]} data - Массив данных для записи.
   * @returns {Promise<void>}
   */
  async writeAll(data: T[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }
}