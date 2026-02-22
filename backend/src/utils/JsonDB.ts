import fs from 'fs/promises';
import path from 'path';

export class JsonDB<T> {
  private filePath: string;

constructor(fileName: string) {
    // Надежный путь! Ищет папку data в корне запущенного бэкенда
    this.filePath = path.join(process.cwd(), 'data', fileName);
  }
  async readAll(): Promise<T[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Если файла нет - возвращаем пустой массив и создаем файл
      await this.writeAll([]);
      return [];
    }
  }

  async writeAll(data: T[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }
}