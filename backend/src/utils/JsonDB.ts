import fs from 'fs/promises';
import path from 'path';

/**
 * Утилитарный класс для работы с JSON-файлами как с базой данных (NoSQL-подобный JSON-хранитель).
 * Поддерживает автосоздание файлов при их отсутствии.
 * 
 * @template T Тип данных элементов, хранящихся внутри коллекции.
 */
export class JsonDB<T> {
  /**
   * Абсолютный путь к целевому JSON файлу базы данных.
   * @private
   */
  private filePath: string;

  /**
   * Создает новый экземпляр JsonDB для управления конкретным файлом коллекции.
   * 
   * @param {string} fileName - Название JSON-файла (например, 'products.json').
   */
  constructor(fileName: string) {
    this.filePath = path.join(process.cwd(), 'data', fileName);
  }

  /**
   * Асинхронно считывает все записи из файла базы данных.
   * Если файл не существует, он будет создан с пустым массивом.
   * 
   * @returns {Promise<T[]>} Возвращает массив объектов типа T.
   */
  async readAll(): Promise<T[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as T[];
    } catch (error) {
      await this.writeAll([]);
      return [];
    }
  }

  /**
   * Асинхронно перезаписывает текущую коллекцию данных в JSON-файл.
   * Данные форматируются с отступами в 2 пробела для читаемости.
   * 
   * @param {T[]} data - Массив данных для перезаписи.
   * @returns {Promise<void>}
   */
  async writeAll(data: T[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}