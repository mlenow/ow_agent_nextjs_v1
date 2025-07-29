import sql from 'mssql';

const config: sql.config = {
  server: process.env.DB_SERVER!,
  database: process.env.DB_DATABASE!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

let connectionPool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (!connectionPool) {
    try {
      connectionPool = await sql.connect(config);
      console.log('✅ Connected to SQL Server');
    } catch (err) {
      console.error('❌ Failed to connect to SQL Server:', err);
      throw err;
    }
  }
  return connectionPool;
}

export { sql };
