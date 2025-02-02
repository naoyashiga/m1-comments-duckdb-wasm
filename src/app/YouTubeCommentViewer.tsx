import React, { useState } from 'react';
import { useInitializedDuckDB } from './useInitializedDuckDB';
import YouTubeCommentTable from './YouTubeCommentTable';
import { useAsync, useDebounce } from "react-use";

const YouTubeCommentViewer: React.FC = () => {
  const { value: db, loading: dbLoading, error: dbError } = useInitializedDuckDB('comments');
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");

  useDebounce(
    () => {
      setSearchText(inputText);
    },
    500,
    [inputText]
  );

  const { value: result, loading: searchLoading } = useAsync(async () => {
    if (!db) return null;

    const conn = await db.connect();
    try {
      if (!searchText.trim()) {
        return await conn.query(`
          SELECT * FROM comments 
          ORDER BY time_parsed DESC
        `);
      }

      // 検索文字列がある場合は text で検索
      const pstmt = await conn.prepare(`
        SELECT * FROM comments 
        WHERE text ILIKE ?
        ORDER BY time_parsed DESC
      `);

      const sanitized = searchText.replace(/%/g, "");
      const searchPattern = `%${sanitized}%`;
      
      return await pstmt.query(searchPattern);
    } finally {
      await conn.close();
    }
  }, [searchText]);

  if (dbLoading) return <div>Loading database...</div>;
  if (dbError) return <div>Error: {dbError.message}</div>;
  if (searchLoading) return <div>Searching...</div>;

  const comments = result?.toArray().map(row => ({
    cid: row.cid,
    text: row.text,
    time: row.time,
    author: row.author,
    channel: row.channel,
    votes: row.votes,
    replies: row.replies,
    photo: row.photo,
    heart: row.heart,
    reply: row.reply,
    time_parsed: row.time_parsed
  })) ?? [];

  return (
    <div style={{ padding: '20px' }}>
      <input
        type="search"
        placeholder="コメントまたは投稿者名で検索"
        onChange={(e) => setInputText(e.target.value)}
        style={{
          width: '300px',
          padding: '8px',
          marginBottom: '20px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />
      
      {comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          検索結果がありません
        </div>
      ) : (
        <YouTubeCommentTable comments={comments} />
      )}
    </div>
  );
};

export default YouTubeCommentViewer;