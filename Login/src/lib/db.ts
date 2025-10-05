import initSqlJs, { Database } from 'sql.js';

let dbInstance: Database | null = null;

export const initDatabase = async (): Promise<Database> => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`
    });

    // Create new database
    const db = new SQL.Database();

    // Load init.sql
    const response = await fetch('/init.sql');
    const sql = await response.text();
    db.run(sql);

    dbInstance = db;
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const getDatabase = (): Database => {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbInstance;
};
