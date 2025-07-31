import mysql from 'mysql2/promise';

let conn;

// MySQL 연결 설정
export const connection = async () => {
  try {
    // MySQL 연결 설정 및 비동기 연결 생성
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,   // MySQL 서버의 주소
      user: process.env.DB_USER,        // MySQL 사용자명
      password: process.env.DB_PASSWORD, // MySQL 비밀번호
      database: process.env.DB_NAME    // 사용할 데이터베이스 이름
    });

    console.log('MySQL에 성공적으로 연결되었습니다.');
  } catch (err) {
    console.error('MySQL 연결 실패:', err.stack);
  }
};

// 연결 종료 함수
export const close = async () => {
  if (conn) {
    try {
      await conn.end();
      console.log('MySQL 연결이 성공적으로 종료되었습니다.');
    } catch (err) {
      console.error('연결 종료 중 오류가 발생했습니다:', err.stack);
    }
  }
};

export const select = async (sql, values) => {
  const [rows] = await conn.execute(sql, values);
  return rows;
};

export const insert = async (sql, values) => {
  const [rows] = await conn.execute(sql, values);
  return rows;
};

export const update = async (sql, values) => {
  const [rows] = await conn.execute(sql, values);
  return rows;
};


