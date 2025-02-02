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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchText(inputText);
  };

  const { value: result, loading: searchLoading } = useAsync(async () => {
    if (!db) return null;

    const conn = await db.connect();
    try {

      const pstmt = await conn.prepare(`
        SELECT * FROM comments 
        WHERE text ILIKE ?
        ORDER BY time_parsed DESC
      `);

      const sanitized = searchText.replace(/%/g, "");
      const searchPattern = `%${sanitized}%`;
      
      const searchResults = await pstmt.query(searchPattern);
      console.log("Search results:", searchResults);
      return searchResults;
    } finally {
      await conn.close();
    }
  }, [db, searchText]);

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
      <form onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="コメントを検索"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            width: '300px',
            padding: '8px',
            marginBottom: '20px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </form>
      
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