import { type AsyncDuckDB, useDuckDb } from "duckdb-wasm-kit";
import { useAsync } from "react-use";

const DATA_JSON_PATH = `${import.meta.env.BASE_URL}/DrZvcM94EY.json`;


export declare type AsyncState<T> =
  | {
      value: undefined;
      loading: true;
      error: undefined;
    }
  | {
      value: undefined;
      loading: false;
      error: Error;
    }
  | {
      value: T;
      loading: false;
      error: undefined;
    };

export function useInitializedDuckDB(tableName: string): AsyncState<AsyncDuckDB> {
  const { db, error: error1 } = useDuckDb();
  const { value: initialized, error: error2 } = useAsync(async () => {
    if (!db) {
      return false;
    }

    await db.open({
      query: { castBigIntToDouble: true, castDecimalToDouble: true },
    });
    
    // JSONファイルの読み込み
    const response = await fetch(DATA_JSON_PATH);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // ファイルをDuckDBに登録
    await db.registerFileBuffer(DATA_JSON_PATH, uint8Array);
    
    // データをテーブルに挿入
    const conn = await db.connect();
    try {
      await conn.query(`
        CREATE TABLE ${tableName} AS 
        SELECT * FROM read_json_auto('${DATA_JSON_PATH}')
      `);
      console.log(`Table ${tableName} created successfully`);
    } catch (error) {
      console.error(`Error creating table ${tableName}:`, error);
    } finally {
      await conn.close();
    }
    
    return true;
  }, [db]);

  if (error1) {
    return { value: undefined, loading: false, error: error1 };
  }
  if (error2) {
    return { value: undefined, loading: false, error: error2 };
  }
  if (!initialized || !db) {
    return { value: undefined, loading: true, error: undefined };
  }
  console.log(`Database initialized successfully`);
  return { value: db, loading: false, error: undefined };
}